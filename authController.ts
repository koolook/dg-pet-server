import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'

import UserSchema from './models/User'
import { Result, validationResult } from 'express-validator'

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
      const existingUser = await UserSchema.findOne({ login })
      if (existingUser) {
        console.log(`User ${login} already exists`)
        return res.status(400).json({ message: `User ${login} already exists` })
      }

      // hash password
      const hash = bcrypt.hashSync(password, 7)

      // create and save user document
      const newUser = new UserSchema({ login, hash, roles: ['user', 'admin'] })
      await newUser.save()

      res.json({ message: `User ${login} created` })
    } catch (error) {
      res.status(400).json('Error creating user')
    }
  }

  login = async (req: Request, res: Response) => {}

  test = async (req: Request, res: Response) => {
    res.json('All fine')
  }
}

export default new AuthController()
