import mongoose, { Schema } from 'mongoose'

import { ImagesType } from './Images.type'

export const ImagesSchema = new Schema({
  //   _id: Schema.Types.String,
  md5: { type: Schema.Types.String, required: true },
  path: { type: Schema.Types.String, required: true },
})

export default mongoose.model<ImagesType & mongoose.Document>('Images', ImagesSchema)
