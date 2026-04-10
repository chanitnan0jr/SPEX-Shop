import type { ErrorRequestHandler } from 'express'

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const status: number = (err as { status?: number }).status ?? 500
  const message: string =
    err instanceof Error ? err.message : 'Internal server error'

  if (status >= 500) {
    console.error('[error]', err)
  }

  // Ensure CORS headers are present even on errors
  const origin = req.headers.origin
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
  }

  res.status(status).json({ error: message })
}
