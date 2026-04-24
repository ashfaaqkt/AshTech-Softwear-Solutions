import express from 'express'
import crypto from 'node:crypto'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const assetsDir = path.join(__dirname, 'private-assets')
const app = express()

const mediaSecret = process.env.MEDIA_SECRET || 'ashtech-media-secret'
const sessionName = 'ashtech_session'
const rateLimitMap = new Map()

const contentTypes = new Map([
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.gif', 'image/gif'],
  ['.mp4', 'video/mp4'],
  ['.webp', 'image/webp'],
  ['.svg', 'image/svg+xml'],
])

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
    `${sessionName}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${60 * 60 * 24}`,
  )
  res.json({ ok: true })
})

app.get('/api/media-url/:file', requireSession, async (req, res) => {
  try {
    const file = req.params.file
    const filePath = path.join(assetsDir, file)
    const normalized = path.normalize(filePath)
    if (!normalized.startsWith(assetsDir)) {
      res.status(400).json({ error: 'Invalid file' })
      return
    }
    await fsp.access(normalized, fs.constants.R_OK)
    const expires = Math.floor(Date.now() / 1000) + 60 * 10
    const payload = `${file}:${expires}`
    const token = sign(payload)
    res.json({ url: `/api/media/${encodeURIComponent(file)}?exp=${expires}&sig=${token}` })
  } catch {
    res.status(404).json({ error: 'Not found' })
  }
})

app.get('/api/media/:file', requireSession, async (req, res) => {
  const file = req.params.file
  const { exp, sig } = req.query
  const expected = sign(`${file}:${exp}`)
  if (!exp || !sig || sig !== expected || Number(exp) < Math.floor(Date.now() / 1000)) {
    res.status(403).json({ error: 'Invalid signature' })
    return
  }

  const filePath = path.normalize(path.join(assetsDir, file))
  if (!filePath.startsWith(assetsDir)) {
    res.status(400).json({ error: 'Invalid file' })
    return
  }

  try {
    const ext = path.extname(filePath).toLowerCase()
    res.setHeader('Content-Type', contentTypes.get(ext) || 'application/octet-stream')
    res.setHeader('Cache-Control', 'private, max-age=600')
    const buffer = await fsp.readFile(filePath)
    res.send(buffer)
  } catch {
    res.status(404).json({ error: 'Not found' })
  }
})

const geminiApiKey = process.env.VITE_GEMINI_API_KEY
const deepseekApiKey = process.env.DEEPSEEK_API_KEY

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

  if (!geminiApiKey && !deepseekApiKey) {
    res.json({ reply: "Ask me about AshTech services, projects, or our founder Ashfaaq KT." })
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

  const aiModels = [
    { provider: 'gemini', model: 'gemini-2.0-flash-lite-preview-02-05' },
    { provider: 'gemini', model: 'gemini-1.5-flash' },
    { provider: 'gemini', model: 'gemini-1.5-flash-8b' },
    { provider: 'deepseek', model: 'deepseek-chat' }
  ]

  for (const ai of aiModels) {
    try {
      let response
      if (ai.provider === 'gemini') {
        if (!geminiApiKey) continue
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${ai.model}:generateContent?key=${geminiApiKey}`
        
        const geminiContents = history.length > 0 
          ? history.map(m => ({
              role: m.role === 'model' ? 'model' : 'user',
              parts: [{ text: m.text }]
            }))
          : []
        
        const payload = {
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: geminiContents.length > 0 ? geminiContents : [{ role: 'user', parts: [{ text: fallbackMessage }] }]
        }

        response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
      } else {
        if (!deepseekApiKey) continue
        const deepseekMessages = [
          { role: "system", content: systemPrompt },
          ...history.map(m => ({
            role: m.role === 'model' ? 'assistant' : 'user',
            content: m.text
          }))
        ]
        if (history.length === 0) deepseekMessages.push({ role: "user", content: fallbackMessage })

        response = await fetch('https://api.deepseek.com/chat/completions', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${deepseekApiKey}`
          },
          body: JSON.stringify({
            model: ai.model,
            messages: deepseekMessages,
            temperature: 0.7,
            max_tokens: 2048
          })
        })
      }

      const data = await response.json()
      if (response.ok) {
        const reply = ai.provider === 'gemini' 
          ? data.candidates?.[0]?.content?.parts?.[0]?.text 
          : data.choices?.[0]?.message?.content

        if (reply) {
          res.json({ reply })
          return
        }
      } else {
        console.warn(`AI model ${ai.model} returned status ${response.status}`, data)
      }
    } catch (error) {
      console.error(`Error with model ${ai.model}:`, error)
    }
  }

  res.json({ reply: "The neural network is busy. Please try again in a moment!" })
})

export default app
