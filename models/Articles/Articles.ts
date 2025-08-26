import mongoose, { Schema } from 'mongoose'

import { ArticlesType } from './Articles.type'

export const ArticlesSchema = new Schema({
  // _id: Schema.Types.String,

  title: { type: Schema.Types.String, required: true },
  body: { type: Schema.Types.String, required: true },
  authorId: { type: Schema.Types.String, required: true },
  imageId: { type: Schema.Types.String },

  isPublished: { type: Schema.Types.Boolean, required: true },

  publishAt: { type: Schema.Types.Number },
  createdAt: { type: Schema.Types.Number },
  updatedAt: { type: Schema.Types.Number },

  attachments: { type: [Schema.Types.String], default: [] },
})

export default mongoose.model<ArticlesType & mongoose.Document>('Articles', ArticlesSchema)
