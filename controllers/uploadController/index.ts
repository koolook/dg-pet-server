import { Request, Response } from 'express'

import UploadedFiles from '../../models/UploadedFiles/UploadedFiles'
import { file2json, saveFile } from './modules/utils'

class ArticleController {
  uploadFile = async (req: Request, res: Response) => {
    try {
      const newFile = await saveFile(req)
      if (!newFile) {
        throw new Error('Can not create file')
      }

      res.json(file2json(newFile))
    } catch (error: any) {
      res.status(400).json(error.message)
    }
  }

  getFiles = async (req: Request, res: Response) => {
    const ownerId = req.user?.userid
    if (!ownerId) {
      return res.status(500).json('Internal error: user mismatch')
    }

    try {
      const files = await UploadedFiles.find({ owner: ownerId }).sort({ name: 1 })

      const responseObj = files.map(file2json)

      return res.json(responseObj)
    } catch (error) {
      return res.status(404).json('Not found')
    }
  }

  deleteFiles = async (req: Request, res: Response) => {
    return res.status(500).json('Not implemented')
  }
}

export default new ArticleController()
