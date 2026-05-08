import express from 'express'
import crypto from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(path.dirname(__filename)) // Go up to root if needed, but we don't need it now
const app = express()

const mediaSecret = process.env.MEDIA_SECRET || 'ashtech-media-secret'
const sessionName = 'ashtech_session'
const rateLimitMap = new Map()

function sign(value) {
  return crypto.createHmac('sha256', mediaSecret).update(value).digest('base64url')
}

function parseCookies(header = '') {
  return Object.fromEntries(
    header
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((pair) => {
        const idx = pair.indexOf('=')
        const key = decodeURIComponent(pair.slice(0, idx))
        const value = decodeURIComponent(pair.slice(idx + 1))
        return [key, value]
      }),
  )
}

function issueStatelessSession() {
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24
  const payload = `v1:${expiresAt}`
  const signature = sign(payload)
  return `${payload}.${signature}`
}

function verifyStatelessSession(req) {
  const cookies = parseCookies(req.headers.cookie || '')
  const token = cookies[sessionName]
  if (!token) return false
  
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return false
  
  if (sign(payload) !== signature) return false
  
  const [version, expiresAt] = payload.split(':')
  if (Number(expiresAt) < Date.now()) return false
  
  return true
}

function requireSession(req, res, next) {
  if (!verifyStatelessSession(req)) {
    res.status(401).json({ error: 'Session required' })
    return
  }
  next()
}

app.use(express.json({ limit: '1mb' }))

app.get('/api/session', (req, res) => {
  const token = issueStatelessSession()
  res.setHeader(
    'Set-Cookie',
    `${sessionName}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${60 * 60 * 24}`,
  )
  res.json({ ok: true })
})

const geminiApiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY

app.post('/api/chat', requireSession, async (req, res) => {
  const history = req.body?.messages || []
  const fallbackMessage = String(req.body?.message || '').trim()

  if (!history.length && !fallbackMessage) {
    res.status(400).json({ error: 'Message required' })
    return
  }

  // Rate Limiting
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown'
  const now = Date.now()
  const userRecord = rateLimitMap.get(ip) || { count: 0, lastReset: now }

  if (now - userRecord.lastReset > 60000) {
    userRecord.count = 0
    userRecord.lastReset = now
  }

  if (userRecord.count >= 10) {
    res.json({ reply: "You are sending too many messages. Please wait a moment." })
    return
  }

  userRecord.count++
  rateLimitMap.set(ip, userRecord)

  // Local fallback response if no API key is present
  const localFallback = "I am AshTech AI. I can help you with information about AshTech Software Solutions and our founder Ashfaaq KT. How can I assist you today?"

  if (!geminiApiKey) {
    console.warn("GEMINI_API_KEY is missing")
    res.json({ reply: localFallback })
    return
  }

  const systemPrompt = `You are AshTech AI, the professional assistant for AshTech Software Solutions. 

    STRICT TOPIC LIMIT: You are programmed to ONLY discuss AshTech Software Solutions (our company) and Ashfaaq KT (our founder). If you are asked about any other topics, politely inform the user that you are an AI dedicated specifically to AshTech and offer to help them with information about our services or the founder.

    Our Company: Based in Kozhikode, Kerala. We build AI tools, Mobile apps (Android/Cross-platform), Web3/Blockchain solutions, Robotics software, E-commerce, and premium Portfolios.
    Our Founder: Ashfaaq KT (Arabic name: أشفاق كي تي, Full name: Ashfaaq Feroz Muhammad). He is a B.Sc. Computer Science student at BITS Pilani. He is an expert in MERN Full-Stack development, AI-assisted workflows, and UI/UX. Website: ashfaaqkt.com.

    "How It Works" Process: 
    1. Sign In & Connect: Apply for projects and browse developer rates.
    2. Select & Confirm: Handpick a developer and get SMS/Email confirmation.
    3. Live Tracking: Watch development live with secure comments.
    4. Transparent Billing: Clear breakdown of API, DB, and labor costs.
    5. Delivery: Receive complete project folder and source code.

    STYLE & FORMATTING:
    - Always use Markdown for formatting: use **bold** for emphasis and create Markdown tables to organize information whenever possible.
    - If the user speaks Arabic, you MUST respond in Arabic.
    - Provide helpful, professional, and detailed answers.`

  // Gemini models with explicit versions
  const aiModels = [
    { provider: 'gemini', model: 'gemini-1.5-flash', version: 'v1' },
    { provider: 'gemini', model: 'gemini-1.5-flash-8b', version: 'v1' },
    { provider: 'gemini', model: 'gemini-2.0-flash-lite-preview-02-05', version: 'v1beta' }
  ]

  for (const ai of aiModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/${ai.version}/models/${ai.model}:generateContent?key=${geminiApiKey}`
      
      // Ensure history alternates: user, model, user, model...
      let geminiContents = []
      if (history.length > 0) {
        history.forEach((m, idx) => {
          const expectedRole = idx % 2 === 0 ? 'user' : 'model'
          const actualRole = m.role === 'model' ? 'model' : 'user'
          
          // Only push if it matches the expected alternating pattern to avoid API errors
          if (actualRole === expectedRole) {
            geminiContents.push({
              role: actualRole,
              parts: [{ text: m.text }]
            })
          }
        })
      }

      // If no valid history or last was model, add the current message
      if (geminiContents.length === 0 || geminiContents[geminiContents.length - 1].role === 'model') {
        geminiContents.push({
          role: 'user',
          parts: [{ text: fallbackMessage }]
        })
      }
      
      const payload = {
        system_instruction: { 
          parts: [{ text: systemPrompt }] 
        },
        contents: geminiContents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      }

      console.log(`Attempting Gemini request to ${ai.model} via ${ai.version}...`)
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        console.error(`Gemini Error [${ai.model}] (${ai.version}):`, JSON.stringify(data, null, 2))
        if (response.status === 429) break 
        continue
      }

      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (reply) {
        res.json({ reply })
        return
      }
    } catch (error) {
      console.error(`Fetch Error with model ${ai.model}:`, error.message)
    }
  }

  res.json({ reply: "I'm having a bit of trouble connecting to my knowledge base. Please try again in a moment!" })
})

export default app
