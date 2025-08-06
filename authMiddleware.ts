import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import config from 'config'
import { UserPayload } from './models/user-payload'

export const checkAccess = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.method === 'OPTIONS') next()

    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      console.log('Access token is empty')
      return res.status(401).json({
        message: 'Access token is empty',
      })
    }

    const decoded = jwt.verify(token, config.get<string>('jwtSecret'))
    if (typeof decoded === 'object') req.user = decoded as UserPayload

    return next()
  } catch (error) {
    res.status(401).json({
      message: 'Access denied',
      error,
    })
  }
}

// use STRICTLY after `checkAccess` middleware
export const checkRoles = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log(`User: ${req.user?.userid}`)
    const userRoles = req.user?.roles || ['user']

    let hasRole = false
    userRoles.forEach(async (role) => {
      if (allowedRoles.includes(role)) {
        hasRole = true
      }
    })

    if (!hasRole) {
      return res.status(401).json({
        message: 'Insufficient access rights',
      })
    }

    return next()
  }
}
