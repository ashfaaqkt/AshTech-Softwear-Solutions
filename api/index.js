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
const geminiApiKey = process.env.VITE_GEMINI_API_KEY

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

  if (!geminiApiKey) {
    res.json({ reply: "Ask me about AshTech services, projects, or our founder Ashfaaq KT." })
    return
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`
    
    let formattedContents = []
    if (history.length > 0) {
      formattedContents = history.map(m => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.text }]
      }))
    } else {
      formattedContents = [{ role: 'user', parts: [{ text: fallbackMessage }] }]
    }

    const payload = {
      system_instruction: {
        parts: [{ text: `You are AshTech AI, the professional assistant for AshTech Software Solutions. 
          Our Company: Based in Kozhikode, Kerala. We build AI tools, Mobile apps (Android/Cross-platform), Web3/Blockchain solutions, Robotics software, E-commerce, and premium Portfolios.
          Our Founder: Ashfaaq KT (Arabic name: أشفاق كي تي, Full name: Ashfaaq Feroz Muhammad). He is a B.Sc. Computer Science student at BITS Pilani. He is an expert in MERN Full-Stack development, AI-assisted workflows, and UI/UX. He has experience at Entri Elevate in Kochi and works across India and Saudi Arabia.
          "How It Works" Process: 
          1. Sign In & Connect: Apply for projects and browse developer rates.
          2. Select & Confirm: Handpick a developer and get SMS/Email confirmation.
          3. Live Tracking: Watch development live with secure comments.
          4. Transparent Billing: Clear breakdown of API, DB, and labor costs.
          5. Delivery: Receive complete project folder and source code.
          Style: Provide helpful, detailed, and professional answers. Do not be overly brief.
          IMPORTANT: If the user speaks Arabic, reply in Arabic. Use Markdown (**bold**, tables, lists) to format info.` }]
      },
      contents: formattedContents
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    const data = await response.json()

    if (!response.ok) {
      res.json({ reply: "The neural network is busy. Please try again in a moment!" })
      return
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm not sure how to respond."
    res.json({ reply })
  } catch (error) {
    res.json({ reply: "An error occurred with the AI. Please try again later." })
  }
})

export default app
