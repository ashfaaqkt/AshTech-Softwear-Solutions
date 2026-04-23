import { useEffect, useState } from 'react'

const cache = new Map()
let sessionPromise = null

async function ensureSession() {
  if (!sessionPromise) {
    sessionPromise = fetch('/api/session', { credentials: 'include' })
      .then(() => true)
      .catch(() => false)
  }
  return sessionPromise
}

export function useProtectedAsset(fileName) {
  const [url, setUrl] = useState(() => cache.get(fileName) || '')

  useEffect(() => {
    if (!fileName) {
      setUrl('')
      return
    }

    const cached = cache.get(fileName)
    if (cached) {
      setUrl(cached)
      return
    }

    const controller = new AbortController()

    async function load() {
      try {
        await ensureSession()
        const response = await fetch(`/api/media-url/${encodeURIComponent(fileName)}`, {
          credentials: 'include',
          signal: controller.signal,
        })
        if (!response.ok) return
        const data = await response.json()
        cache.set(fileName, data.url)
        setUrl(data.url)
      } catch {
        // ignore transient backend errors
      }
    }

    load()

    return () => controller.abort()
  }, [fileName])

  return url
}
