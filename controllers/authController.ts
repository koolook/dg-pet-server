import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import config from 'config'

import UsersSchema from '../models/Users/Users'
import { Result, validationResult } from 'express-validator'
import { UploadedFile } from 'express-fileupload'

class AuthController {
  signUp = async (req: Request, res: Response) => {
    try {
      // handle validation results
      const result: Result = validationResult(req)
      if (!result.isEmpty()) {
        return res.status(400).json({
          message: 'Invalid user data provided',
          result,
        })
      }
      const { login, password } = req.body

      // check user exists
      const existingUser = await UsersSchema.findOne({ login })
      if (existingUser) {
        console.log(`User ${login} already exists`)
        return res.status(400).json({ message: `User ${login} already exists` })
      }

      // hash password
      const hash = bcrypt.hashSync(password, 7)

      // create and save user document
      const newUser = new UsersSchema({ login, hash, roles: ['user', 'admin'] })
      await newUser.save()

      res.json({ message: `User ${login} created` })
    } catch (error) {
      res.status(400).json({ message: 'Error creating user', error })
    }
  }

  login = async (req: Request, res: Response) => {
    try {
      const { login, password } = req.body

      // check user exists
      const user = await UsersSchema.findOne({ login })
      if (!user) {
        console.log(`User ${login} does not exist`)
        return res.status(400).json({ message: `User ${login} does not exist` })
      }

      const isAuthorized = bcrypt.compareSync(password, user.hash)

      if (!isAuthorized) {
        console.log(`Access denied to user ${login}`)
        return res.status(400).json({ message: `Access denied to user ${login}` })
      }

      const token = jwt.sign({ userid: user._id, roles: user.roles }, config.get<string>('jwtSecret'), {
        expiresIn: '1h',
      })

      res.json({ token, id: user._id, login: user.login, roles: user.roles })
    } catch (error) {
      res.status(400).json({ message: 'Error logging in', error })
    }
  }

  refresh = async (req: Request, res: Response) => {
    const user = await UsersSchema.findOne({ _id: req.user?.userid })
    if (!user) {
      console.log(`User does not exist`)
      return res.status(400).json({ message: `User does not exist` })
    }

    res.json({ ...req.user, login: user.login })
  }

  test = async (req: Request, res: Response) => {
    res.json('All fine')
  }

  /*   upload = async (req: Request, res: Response) => {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.')
    }

    const sampleFile = req.files.sampleFile as UploadedFile
    const uploadPath = __dirname + '/uploaded/' + sampleFile.name

    sampleFile.mv(uploadPath, function (err) {
      if (err) return res.status(500).send(err)

      res.json({ path: '/uploaded/' + sampleFile.name })
    })
  } */
}

export default new AuthController()
