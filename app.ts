import express, { Application, Request, Response } from 'express'
import { MongoClient } from 'mongodb'

import cors from 'cors'

const app: Application = express()
const port: number = 4000

let mongoClient: MongoClient

app.use(cors())

app.get('/', (req: Request, res: Response) => {
  res.send('>>> Hello from Express with TypeScript!')
})

app.get('/about', async (req: Request, res: Response) => {
  const db = mongoClient.db('pet-base')
  const data = await db.collection('messages').find().toArray()

  console.log(JSON.stringify(data))
  res.send(JSON.stringify(data))
})

async function start() {
  try {
    console.log('Connect DB!')
    mongoClient = new MongoClient('mongodb://mongodb:27017/')
    await mongoClient.connect()
    console.log('Connected')

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`)
    })
  } catch (error) {
    console.log('Server Error', (error as Error).message)
    process.exit(1)
  }
}

start()
