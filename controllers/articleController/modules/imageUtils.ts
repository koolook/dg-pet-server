import config from 'config'
import { Request } from 'express'
import { UploadedFile } from 'express-fileupload'
import fs from 'fs'
import path from 'path'

import Articles from '../../../models/Articles/Articles'
import Images from '../../../models/Images/Images'

export async function insertImage(req: Request) {
  if (req.files?.coverImage) {
    const file = req.files.coverImage as UploadedFile
    try {
      const md5 = file.md5
      const oldImage = await Images.findOne({ md5 })
      if (oldImage) {
        console.log('Using existing image')

        return oldImage._id as string
      }

      const urlPath = path.join('/uploaded', md5 + path.extname(file.name))
      const savePath = path.join(config.get('root_path'), urlPath)

      await file.mv(savePath)

      const newImage = new Images({ path: urlPath, md5 })
      await newImage.save()

      console.log(`Saved image ${newImage._id} to ${savePath}`)

      return newImage._id as string
    } catch (error) {
      console.log(`File upload error: ${(error as any).message}`)
      console.log('Continue without image...')
    }
  }
  return null
}

export async function deleteImage(_id: string) {
  try {
    const image = await Images.findOne({ _id })
    if (!image) {
      return
    }

    const imageOwners = await Articles.find({ imageId: _id })
    if (imageOwners.length === 0) {
      const filePath = path.join(config.get('root_path'), image.path)

      await Images.deleteOne({ _id })
      fs.rmSync(filePath, { recursive: false })
      console.log(`Image ${_id} and file ${filePath} are deleted`)
    }
  } catch (error) {
    console.log(`Error removing image: ${(error as any).message}`)
  }
}
