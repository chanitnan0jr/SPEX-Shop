import 'dotenv/config'
import app from './app'
import { connectDB, closeDB } from './db'

const PORT = Number(process.env.PORT ?? 8080)

async function start(): Promise<void> {
  await connectDB()

  const server = app.listen(PORT, () => {
    console.log(`[server] SpecBot API running on http://localhost:${PORT}`)
  })

  const shutdown = async (signal: string) => {
    console.log(`[server] ${signal} received, shutting down...`)
    server.close(async () => {
      await closeDB()
      console.log('[server] shutdown complete')
      process.exit(0)
    })
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}

start().catch((err) => {
  console.error('[server] failed to start:', err)
  process.exit(1)
})
