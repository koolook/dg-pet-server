import mongoose, { Schema } from 'mongoose'

import { UsersType } from './Users.type'

const UsersSchema = new Schema({
  login: { type: Schema.Types.String, unique: true, required: true },
  hash: { type: Schema.Types.String, required: true },
  roles: [String],
})

export default mongoose.model<UsersType & mongoose.Document>('Users', UsersSchema)
