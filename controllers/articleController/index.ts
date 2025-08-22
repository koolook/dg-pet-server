import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { MongooseError } from 'mongoose'

import Articles from '../../models/Articles/Articles'
import { deleteImage, insertImage } from './modules/imageUtils'

class ArticleController {
  private article2json = (article: any /* : ArticlesType & mongoose.Document */) => {
    const { updatedAt, imageUrl } = article
    return {
      id: article._id,
      title: article.title,
      body: article.body,
      createdAt: article.createdAt,
      isPublished: article.isPublished,
      author: article.authorName,
      ...{ updatedAt, imageUrl },
    }
  }

  create = async (req: Request, res: Response) => {
    const { title, body, isPublished } = req.body
    console.log(`Create new article: ${JSON.stringify(req.body)}`)

    try {
      const imageId = await insertImage(req)
      // create new article
      const newArticle = new Articles({
        title,
        body,
        imageId,
        authorId: new ObjectId(req.user?.userid),
        createdAt: new Date().valueOf(),
        isPublished: isPublished === 'true',
      })

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
  }

  update = async (req: Request, res: Response) => {
    const _id = req.params.id
    // TODO: see if userId chack against Article.authorId is needed
    // const userId = req.user?.userid

    const { title, body, isPublished, removeImage } = req.body

    try {
      const imageId = removeImage ? null : await insertImage(req)
      const unsetClause = removeImage ? { $unset: { imageId: '' } } : {}

      const article = await Articles.findOne({ _id })
      const oldImageId = article?.imageId

      const query = await Articles.updateOne(
        { _id },
        {
          $set: {
            ...(imageId ? { imageId } : {}),
            ...(title ? { title } : {}),
            ...(body ? { body } : {}),
            ...(isPublished !== undefined ? { isPublished } : {}),
            updatedAt: new Date().valueOf(),
          },
          unsetClause,
        }
      )
      console.log(`Updated: ${JSON.stringify({ _id, modified: query.modifiedCount })}`)

      if (oldImageId && (removeImage || imageId)) {
        await deleteImage(oldImageId)
      }
      res.json('OK')
    } catch (error) {
      res.status(400).json({ message: 'Error updating article' })
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
      if (article && (article.isPublished || (userId && article.authorId === userId))) {
        return res.json(this.article2json(article))
      }
    } catch (error) {
      res.status(404).json({ message: 'Article is not available' })
    }
  }

  getManyByIds = async (req: Request, res: Response) => {
    const userId = req.user?.userid
    const requestedIds = req.body.ids as string[]

    try {
      const objIds = requestedIds?.map((id) => new ObjectId(id))

      const articles = await Articles.aggregate([
        {
          $match: {
            $and: [
              objIds?.length > 0 ? { _id: { $in: objIds } } : {},

              { $or: [{ isPublished: true }, ...(userId ? [{ authorId: userId }] : [])] },
            ],
          },
        },
        { $sort: { createdAt: -1 } },
        {
          $addFields: {
            authorIdObj: {
              $toObjectId: '$authorId',
            },
            imageIdObj: {
              $toObjectId: '$imageId',
            },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'authorIdObj',
            foreignField: '_id',
            as: 'author',
          },
        },
        {
          $lookup: {
            from: 'images',
            localField: 'imageIdObj',
            foreignField: '_id',
            as: 'image',
          },
        },
        {
          $set: {
            authorName: {
              $first: '$author.login',
            },
            imageUrl: {
              $first: '$image.path',
            },
          },
        },
      ])

      if (!articles || !articles.length) {
        throw new Error()
      }

      return res.json(articles.map((article) => this.article2json(article)))
    } catch (error) {
      return res.status(404).json({ message: (error as any).message })
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

      const oldImageId = article.imageId

      const deleted = await Articles.deleteOne({ _id })
      if (deleted) {
        console.log(`Deleted ${_id}`)
        if (oldImageId) {
          await deleteImage(oldImageId)
        }

        return res.json('OK')
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
