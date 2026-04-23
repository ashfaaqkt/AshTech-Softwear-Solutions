import express from 'express'
import crypto from 'node:crypto'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const distDir = path.join(rootDir, 'dist')
const assetsDir = path.join(__dirname, 'private-assets')
const app = express()
const port = Number(process.env.PORT || 3001)
const mediaSecret = process.env.MEDIA_SECRET || 'ashtech-media-secret'
const sessionName = 'ashtech_session'

let geminiApiKey = process.env.VITE_GEMINI_API_KEY
if (!geminiApiKey) {
  try {
    const envContent = fs.readFileSync(path.join(rootDir, '.env'), 'utf-8')
    const match = envContent.match(/VITE_GEMINI_API_KEY=(.+)/)
    if (match) geminiApiKey = match[1].trim()
  } catch (err) {
    console.warn("Could not load .env file for Gemini API Key")
  }
}

const sessions = new Map()

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

function issueSession() {
  const id = crypto.randomBytes(24).toString('hex')
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24
  sessions.set(id, expiresAt)
  return id
}

function readSession(req) {
  const cookies = parseCookies(req.headers.cookie || '')
  const sessionId = cookies[sessionName]
  if (!sessionId) return false
  const expiresAt = sessions.get(sessionId)
  if (!expiresAt || expiresAt < Date.now()) {
    sessions.delete(sessionId)
    return false
  }
  return true
}

function requireSession(req, res, next) {
  if (!readSession(req)) {
    res.status(401).json({ error: 'Session required' })
    return
  }
  next()
}

function cleanupSessions() {
  const now = Date.now()
  for (const [id, expiresAt] of sessions.entries()) {
    if (expiresAt < now) sessions.delete(id)
  }
}

app.use(express.json({ limit: '1mb' }))

app.get('/api/session', (req, res) => {
  cleanupSessions()
  const sessionId = issueSession()
  res.setHeader(
    'Set-Cookie',
    `${sessionName}=${sessionId}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${60 * 60 * 24}`,
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
    await fsp.access(filePath, fs.constants.R_OK)
    const ext = path.extname(filePath).toLowerCase()
    res.setHeader('Content-Type', contentTypes.get(ext) || 'application/octet-stream')
    res.setHeader('Cache-Control', 'private, max-age=600')
    fs.createReadStream(filePath).pipe(res)
  } catch {
    res.status(404).json({ error: 'Not found' })
  }
})

app.post('/api/chat', requireSession, async (req, res) => {
  const message = String(req.body?.message || '').trim()
  if (!message) {
    res.status(400).json({ error: 'Message required' })
    return
  }

  if (!geminiApiKey) {
    console.error("Gemini API key missing")
    res.json({ reply: "I am specialized in AshTech topics. Ask me about services, projects, or founder." })
    return
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`
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
          Style: Keep answers super brief, helpful, and modern. 
          IMPORTANT: If the user speaks Arabic, reply in Arabic. Use Markdown (**bold**, tables, lists) to format info.` }]
      },
      contents: [
        { parts: [{ text: message }] }
      ]
    }

    let response;
    let data;
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      data = await response.json()

      if (response.ok) break;

      if (data?.error?.code === 503 || data?.error?.code === 429) {
        if (attempt < 3) {
          console.warn(`Gemini network busy (503). Retrying in ${attempt}s...`)
          await new Promise(res => setTimeout(res, attempt * 1000))
          continue;
        }
      } else {
        break; // Stop immediately for other fatal errors (400, 403, 404)
      }
    }

    if (!response.ok) {
      console.error("Gemini API Error:", data)
      res.json({ reply: "The neural network is currently experiencing heavy server traffic. Please ask me again in a moment!" })
      return
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm not sure how to respond to that."
    res.json({ reply })

  } catch (error) {
    console.error("Gemini Fetch Error:", error)
    res.json({ reply: "An error occurred while communicating with the AI. Please try again later." })
  }
})

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir, { index: false, maxAge: '1h' }))
  app.get(/.*/, (req, res, next) => {
    if (req.path.startsWith('/api/')) return next()
    res.sendFile(path.join(distDir, 'index.html'))
  })
} else {
  app.get('/', (req, res) => {
    res.json({ ok: true, message: 'Build the frontend first.' })
  })
}

app.listen(port, () => {
  console.log(`AshTech server running on http://localhost:${port}`)
})
