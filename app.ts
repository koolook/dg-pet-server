import config from 'config'
import cors from 'cors'
import express, { Application, Request, Response } from 'express'
import { createServer } from 'http'
import mongoose from 'mongoose'
import { Server, Socket } from 'socket.io'

import articleRouter from './routes/articleRouter'
import authRouter from './routes/authRouter'
import { initCron } from './services/Cron'

const app: Application = express()
const port: number = config.get('port') || 4000

try {
  if (!config.get<string>('jwtSecret')) {
    throw new Error('JWT secret is not set. Set environment variable `HOST_JWT_SECRET` before you start server.')
  }
} catch (error) {
  throw error
}

app.use(express.json())
app.use(
  cors({
    credentials: true,
    origin: 'http://localhost:3000',
  })
)

const server = createServer(app)
const io = new Server(server, { cors: { origin: '*' } })

// io.use(socketAuthStrict) // ????

io.on('connection', (socket: Socket) => {
  console.log('A user connected ')
})

app.use('/static', express.static('static'))
app.use('/uploaded', express.static('uploaded'))

app.use('/auth', authRouter)
app.use('/article', articleRouter)

app.get('/', (req: Request, res: Response) => {
  res.send('>>> Hello from Express with TypeScript!')
})

async function start() {
  try {
    console.log('Connect DB!')
    await mongoose.connect(config.get('dbUrl'))
    server.listen(port, () => {
      // startCronJob(io)
      initCron(io)

      console.log(`Server running on http://localhost:${port}`)
    })
  } catch (error) {
    console.log('Server Error', (error as Error).message)
    process.exit(1)
  }
}

start()
