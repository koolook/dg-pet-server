import { Request } from 'express'
import { UploadedFile } from 'express-fileupload'
import Images from '../../../models/Images/Images'

export async function insertImage(req: Request) {
  if (req.files?.coverImage) {
    const file = req.files.coverImage as UploadedFile
    const path = '/uploaded/' + file.name

    try {
      await file.mv('/app' + path)

      const newImage = new Images({ path })
      await newImage.save()

      return newImage._id as string
    } catch (error) {
      console.log('File upload error: ' + (error as any).message)
      console.log('Continue without image...')
    }
  }
  return null
}
