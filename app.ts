import express, { Application, Request, Response } from 'express'
import mongoose from 'mongoose'
import config from 'config'

import authRouter from './routes/authRouter'
import articleRouter from './routes/articleRouter'

import cors from 'cors'

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

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`)
    })
  } catch (error) {
    console.log('Server Error', (error as Error).message)
    process.exit(1)
  }
}

start()
