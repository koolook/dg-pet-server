import mongoose, { Schema } from "mongoose";

import { ArticlesType } from "./Articles.type";

export const ArticlesSchema = new Schema({
    _id: Schema.Types.String,

    title: { type: Schema.Types.String, required: true },
    body: { type: Schema.Types.String, required: true },
    imageId: { type: Schema.Types.String },

    isPublished: { type: Schema.Types.Boolean },

    publishAt: { type: Schema.Types.Number },
    createdAt: { type: Schema.Types.Number },
    updatedAt: { type: Schema.Types.Number }
});

export default mongoose.model<ArticlesType & mongoose.Document>('Articles', ArticlesSchema);
