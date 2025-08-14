import mongoose, { Schema } from 'mongoose'

import { User } from './User.type'

const UserSchema = new Schema({
  login: { type: Schema.Types.String, unique: true, required: true },
  hash: { type: Schema.Types.String, required: true },
  roles: [String],
})

export default mongoose.model<User & mongoose.Document>('User', UserSchema)
