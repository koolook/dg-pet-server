import { Request, Response } from 'express'
import { ArticlesType } from 'models/Articles/Articles.type'
import { ObjectId } from 'mongodb'
import { MongooseError } from 'mongoose'

import Articles from '../../models/Articles/Articles'
import { file2json, safeDelete } from '../uploadController/modules/utils'
import { deleteImage, insertImage } from './modules/imageUtils'

const article2json = (article: any) => {
  const { updatedAt, imageUrl, publishAt } = article

  const attachments =
    article.attachments && Array.isArray(article.attachments)
      ? (article.attachments as any[]).map((a) => file2json(a))
      : undefined

  return {
    id: article._id,
    title: article.title,
    body: article.body,
    createdAt: article.createdAt,
    isPublished: article.isPublished,
    author: article.authorName,
    ...{ updatedAt, imageUrl, publishAt, attachments },
  }
}

class ArticleController {
  create = async (req: Request, res: Response) => {
    const { title, body } = req.body
    console.log(`Create new article: ${JSON.stringify(req.body)}`)

    const toPublish = req.body.publish === 'true'
    const publishAt = req.body.publishAt ? Number.parseInt(req.body.publishAt, 10) : null

    const attachmentIds = req.body.attachments ? (JSON.parse(req.body.attachments) as string[]) : undefined

    try {
      const imageId = await insertImage(req)
      // create new article
      const newArticle = new Articles({
        title,
        body,
        imageId: imageId ? new ObjectId(imageId) : null,
        authorId: new ObjectId(req.user?.userid),
        createdAt: new Date().valueOf(),
        isPublished: toPublish && !publishAt,
      })

      if (toPublish && publishAt) {
        newArticle.publishAt = publishAt
      }

      newArticle.attachments = attachmentIds

      console.log('Saving...')
      await newArticle.save()
      console.log('Done')

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
    const articleId = req.params.id
    // TODO: see if userId check against Article.authorId is needed
    // const userId = req.user?.userid

    const { title, body, removeImage } = req.body

    const set: Partial<ArticlesType> = {}
    const unset: Partial<Record<keyof ArticlesType, string>> = {}

    const attachmentIds = req.body.attachments ? (JSON.parse(req.body.attachments) as string[]) : []

    try {
      const article = await Articles.findOne({ _id: articleId })
      if (!article) {
        return res.status(404).json('Not found')
      }

      if (title) {
        set.title = title
      }
      if (body) {
        set.body = body
      }

      const oldImageId = article.imageId
      const imageId = removeImage ? null : await insertImage(req)
      if (imageId) {
        set.imageId = imageId
      }
      if (removeImage) {
        unset.imageId = ''
      }

      if (req.body.publish !== undefined) {
        const toPublish = req.body.publish === 'true'
        const publishAt = req.body.publishAt ? Number.parseInt(req.body.publishAt, 10) : null

        set.isPublished = toPublish && !publishAt

        if (toPublish && publishAt) {
          set.publishAt = publishAt
        } else {
          unset.publishAt = ''
        }
      }

      set.attachments = attachmentIds

      const newSet = new Set(attachmentIds.map((s) => s.toString()))

      const filesToDelete = article.attachments?.filter((fileId) => !newSet.has(fileId.toString()))
      console.log(`Id's to delete: ${JSON.stringify(filesToDelete)}`)

      const query = await Articles.updateOne(
        { _id: articleId },
        {
          $set: {
            ...set,
            updatedAt: new Date().valueOf(),
          },
          $unset: unset,
        }
      )
      console.log(`Updated: ${JSON.stringify({ _id: articleId, modified: query.modifiedCount })}`)

      if (oldImageId && (removeImage || imageId)) {
        await deleteImage(oldImageId)
      }

      if (filesToDelete) {
        await safeDelete(filesToDelete)
      }

      res.json('OK')
    } catch (error) {
      res.status(400).json({ message: `Error updating article: ${(error as any).message}` })
    }
  }

  getById = async (req: Request, res: Response) => {
    const _id = req.params.id
    const userId = req.user?.userid

    try {
      const article = await Articles.findOne({ _id })
      if (article && (article.isPublished || (userId && article.authorId.toString() === userId))) {
        return res.json(article2json(article))
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

      const joinAttachmentsPipeline = [
        {
          $lookup: {
            from: 'uploadedfiles',
            localField: 'attachments',
            foreignField: '_id',
            as: 'attachment_docs',
          },
        },
        {
          $set: {
            attachments: '$attachment_docs',
          },
        },
      ]

      const joinAuthorPipline = [
        {
          $lookup: {
            from: 'users',
            localField: 'authorId',
            foreignField: '_id',
            as: 'author',
          },
        },
        {
          $set: {
            authorName: {
              $first: '$author.login',
            },
          },
        },
      ]

      const joinImagesPipline = [
        {
          $lookup: {
            from: 'images',
            localField: 'imageId',
            foreignField: '_id',
            as: 'image',
          },
        },
        {
          $set: {
            imageUrl: {
              $first: '$image.path',
            },
          },
        },
      ]

      const articles = await Articles.aggregate([
        {
          $match: {
            $and: [
              objIds?.length > 0 ? { _id: { $in: objIds } } : {},

              { $or: [{ isPublished: true }, ...(userId ? [{ authorId: new ObjectId(userId) }] : [])] },
            ],
          },
        },
        ...joinAttachmentsPipeline,
        ...joinAuthorPipline,
        ...joinImagesPipline,
      ])

      return res.json(articles.map((article) => article2json(article)))
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

      if (article.authorId.toString() !== userId) {
        return res.status(401).json({ message: 'Author mismatch' })
      }

      const oldImageId = article.imageId

      const filesToDelete = article.attachments

      const deleted = await Articles.deleteOne({ _id })
      if (deleted) {
        console.log(`Deleted ${_id}`)
        if (oldImageId) {
          await deleteImage(oldImageId)
        }

        if (filesToDelete) {
          await safeDelete(filesToDelete)
        }

        return res.json('OK')
      }
    } catch (error) {
      return res.status(404).json({ message: 'Could not delete anything' })
    }
  }
}

export default new ArticleController()
