import express, { Application, Request, Response } from 'express'
import mongoose from 'mongoose'
import config from 'config'

import MessageModel from './models/ServerMessage'
import authRouter from './authRouter'

import cors from 'cors'
import fileUpload from 'express-fileupload'

const app: Application = express()
const port: number = config.get('port') || 4000

app.use(express.json())
app.use(
  cors({
    credentials: true,
    origin: 'http://localhost:3000',
  })
)

app.use(fileUpload())

app.use('/static', express.static('static'))
app.use('/uploaded', express.static('uploaded'))

app.use('/auth', authRouter)

app.get('/', (req: Request, res: Response) => {
  res.send('>>> Hello from Express with TypeScript!')
})

app.get('/about', async (req: Request, res: Response) => {
  const data = await MessageModel.find()

  console.log(JSON.stringify(data))
  res.send(JSON.stringify(data))
})

app.get('/seed', async (req, res) => {
  try {
    ;['Hello! this is a pet server', "I'm still here", "Don't turn me off, please"].forEach(async (s) => {
      const m = new MessageModel()
      m.text = s
      await m.save()
    })

    res.json('Done')
  } catch (error) {
    res.status(400).json('Error seeding data')
  }
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
