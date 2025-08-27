import config from 'config'
import { Request } from 'express'
import { UploadedFile } from 'express-fileupload'
import fs from 'fs'
import mongoose from 'mongoose'
import path from 'path'

import ArticleAttachmenRefs from '../../../models/ArticleAttachmentRefs/ArticleAttachmenRefs'
import { ArticleAttachmentRefsType } from '../../../models/ArticleAttachmentRefs/ArticleAttachmenRefs.type'
import UploadedFiles from '../../../models/UploadedFiles/UploadedFiles'
import { UploadedFilesType } from '../../../models/UploadedFiles/UploadedFiles.type'

export async function saveFile(req: Request) {
  const userId = req.user?.userid
  const file = req.files?.fileData as UploadedFile
  if (file && userId) {
    const oldFile = await UploadedFiles.findOne({ name: file.name, owner: userId })
    if (oldFile) {
      console.log('Using existing file')

      return oldFile
    }

    const urlPath = path.join('/uploaded', `${userId}`, file.name)
    const savePath = path.join(config.get('root_path'), urlPath)

    fs.mkdirSync(path.join(config.get('root_path'), 'uploaded', `${userId}`), { recursive: true })

    await file.mv(savePath)

    const newFile = new UploadedFiles<UploadedFilesType>({
      path: urlPath,
      name: file.name,
      md5: file.md5,
      owner: userId,
      isTemporary: true,
      size: file.size,
      type: file.mimetype,
    })
    await newFile.save()

    console.log(`Saved file ${newFile.name} to ${savePath}`)

    return newFile
  }
  return null
}

export async function deleteFiles(ids: string[]) {
  const query = { _id: { $in: ids } }

  const paths = await UploadedFiles.find(query, { path: 1 })

  const delQuery = await UploadedFiles.deleteMany(query)
  console.log(`Deleted file records ${delQuery.deletedCount}`)

  const rootPath = config.get<string>('root_path')
  paths.forEach((p) => {
    fs.rmSync(path.join(rootPath, p.path), { recursive: true })
    console.log(`Deleted from disk: ${p.path}`)
  })
}

export async function deleteRefs(refs: (ArticleAttachmentRefsType & mongoose.Document)[]) {
  console.log(`deleteRefs: ${JSON.stringify(refs)}`)

  const deleteQuery = await ArticleAttachmenRefs.deleteMany({
    _id: { $in: refs.map((r) => r._id) },
  })
  console.log(`\tdeleteQuery: ${deleteQuery.deletedCount}`)

  const cleanupIds = await UploadedFiles.aggregate([
    {
      $lookup: {
        from: 'articleattachmentrefs',
        localField: '_id',
        foreignField: 'fileId',
        as: 'refs',
      },
    },
    {
      $match: {
        refs: { $size: 0 },
      },
    },
    {
      $project: {
        _id: 1,
      },
    },
  ])

  console.log(`Cleanup IDs: ${JSON.stringify(cleanupIds)}`)

  await deleteFiles(cleanupIds)
}

export const file2json = (file: UploadedFilesType & mongoose.Document) => {
  const { _id, name, path, size, type } = file
  return {
    id: _id,
    name,
    path,
    size,
    type,
  }
}
