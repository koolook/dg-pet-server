import config from 'config'
import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

import { UserPayload } from '../models/user-payload'

/**
 * Authentication middleware.
 * Verifies JWT provided in headers.
 * If verification passes token data is attached to
 * request object so it can be used in request handlers.
 * If verification fails auth error is sent in response.
 * @param req
 * @param res
 * @param next
 * @returns
 */
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

/**
 * Authentication middleware.
 * A weaker version of `checkAccess`.
 * If JWT is provided it checks the token and attach token data to request.
 * If JST is absent it just passes.
 * As the result reuqest handler can implement anonymous access.
 * - user data present - authorized
 * - no user data - anonymous
 *
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const checkToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.method === 'OPTIONS') next()

    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return next()
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

/**
 * Autorisation middleware factory
 * Produces a middlware that checks if request contains specific user roles
 * Use this strictly after `checkAccess` middleware
 * @param allowedRoles - array of roles resulting middleware will check
 * @returns
 */
export const checkRoles = (allowedRoles: string[]) => (req: Request, res: Response, next: NextFunction) => {
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
