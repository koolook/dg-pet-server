import mongoose, { Schema } from 'mongoose'

import { ArticleAttachmentRefsType } from './ArticleAttachmenRefs.type'

export const ArticleAttachmentRefsSchema = new Schema({
  articleId: { type: Schema.Types.ObjectId, ref: 'Articles', required: true },
  fileId: { type: Schema.Types.ObjectId, ref: 'UploadedFiles', required: true },
})

ArticleAttachmentRefsSchema.index({ articleId: 1, fileId: 1 }, { unique: true })

export default mongoose.model<ArticleAttachmentRefsType & mongoose.Document>(
  'ArticleAttachmentRefs',
  ArticleAttachmentRefsSchema
)
