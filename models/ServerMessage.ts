import mongoose, { Schema } from 'mongoose'
import { ServerMessage } from './ServerMessage.type'

const MessageSchema = new Schema({
  text: { type: Schema.Types.String, requred: true },
})

export default mongoose.model<ServerMessage & mongoose.Document>('ServerMessages', MessageSchema, 'messages')
