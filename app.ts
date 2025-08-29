import config from 'config'
import cors from 'cors'
import express, { Application, Request, Response } from 'express'
import { createServer } from 'http'
import mongoose from 'mongoose'
import { Server, Socket } from 'socket.io'

import articleRouter from './routes/articleRouter'
import authRouter from './routes/authRouter'
import uploadRouter from './routes/uploadRouter'
import { initCron } from './services/Cron'

const app: Application = express()
const port: number = config.get('port') || 4000

if (!config.get<string>('jwtSecret')) {
  throw new Error('JWT secret is not set. Set environment variable `HOST_JWT_SECRET` before you start server.')
}

app.use(
  cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  })
)

app.use(express.json())

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
app.use('/upload', uploadRouter)

app.get('/', (req: Request, res: Response) => {
  res.send('>>> Hello from Express with TypeScript!')
})

async function start() {
  try {
    console.log('Starting...')
    await mongoose.connect(config.get('dbUrl') || 'mongodb://mongodb:27017/')

    console.log('Connected DB')

    server.listen(port, () => {
      initCron(io)

      console.log(`Server running on port: ${port}`)
    })
  } catch (error) {
    console.log('Server Error', (error as Error).message)
    process.exit(1)
  }
}

start()
