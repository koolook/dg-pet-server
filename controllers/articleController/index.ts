import { Request, Response } from 'express'

import Articles from '../../models/Articles/Articles'
import { MongooseError } from 'mongoose'

class ArticleController {
  update = async (req: Request, res: Response) => {
    const { id } = req.body
    if (!id) {
      const { title, body, publish } = req.body
      console.log(`Create new article: ` + JSON.stringify(req.body))

      // create new article
      const newArticle = new Articles({
        title,
        body,
        authorId: req.user?.userid,
        createdAt: new Date().valueOf(),
        isPublished: !!publish,
      })

      try {
        console.log('Saving...')
        await newArticle.save()
        console.log('Ready')
        return res.json({ id: newArticle._id })
      } catch (error) {
        console.log('Failed')
        console.log((error as MongooseError).message)
        return res.status(500).json({
          name: (error as any).name,
          code: (error as any).code,
        })
      }
    } else {
      // update existing article
      res.status(500).json({ txt: 'not implemented' })
    }
  }

  feed = async (req: Request, res: Response) => {
    const userId = req.user?.userid

    try {
      const feedIds = await Articles.aggregate<{ _id: string }>([
        userId ? { $match: { $or: [{ isPublished: true }, { authorId: userId }] } } : { $match: { isPublished: true } },
        { $sort: { createdAt: -1 } },
        { $project: { _id: 1 } },
      ])

      res.json(feedIds.map(({ _id }) => _id))
    } catch (error) {
      res.status(500).json({
        error: (error as Error).message,
      })
    }
  }

  getById = async (req: Request, res: Response) => {
    const _id = req.params.id
    const userId = req.user?.userid

    try {
      const article = await Articles.findOne({ _id })
      if (article?.isPublished) {
        return res.json({
          id: article._id,
          title: article.title,
          body: article.body,
        })
      } else {
        throw new Error()
      }
    } catch (error) {
      res.status(404).json({ message: 'Article is not available' })
    }
  }

  deleteById = async (req: Request, res: Response) => {
    const _id = req.params.id
    const userId = req.user?.userid

    if (!userId) {
      return res.status(401).json({
        message: 'Not authorized',
      })
    }

    try {
      const article = await Articles.findOne({ _id })
      if (!article) {
        return res.status(404).json({ message: 'not found' })
      }

      if (article.authorId !== userId) {
        return res.status(401).json({ message: 'Not authorized' })
      }

      const deleted = await Articles.deleteOne({ _id })
      if (deleted) {
        console.log(`Deleted ${_id}`)
        return res.json({ message: 'success' })
      } else {
        throw new Error()
      }
    } catch (error) {
      return res.status(404).json({ message: 'Could not delete anything' })
    }
  }

  /* 
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.')
    }

    const sampleFile = req.files.sampleFile as UploadedFile
    const uploadPath = __dirname + '/uploaded/' + sampleFile.name

    sampleFile.mv(uploadPath, function (err) {
      if (err) return res.status(500).send(err)

      res.json({ path: '/uploaded/' + sampleFile.name })
    }) 
*/
}

export default new ArticleController()
