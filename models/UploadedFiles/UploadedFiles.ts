import mongoose, { Schema } from 'mongoose'

import { UploadedFilesType } from './UploadedFiles.type'

export const UploadedFilesSchema = new Schema({
  //   _id: Schema.Types.String,
  owner: { type: Schema.Types.String, required: true },
  md5: { type: Schema.Types.String, required: true },
  path: { type: Schema.Types.String, required: true },
  name: { type: Schema.Types.String, required: true },
  type: { type: Schema.Types.String, required: true },
  size: { type: Schema.Types.Number, required: true },
  isTemporary: { type: Schema.Types.Boolean, required: true },
})

export default mongoose.model<UploadedFilesType & mongoose.Document>('UploadedFiles', UploadedFilesSchema)
