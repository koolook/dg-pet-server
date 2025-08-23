/**
 * @file Router definition for '/auth' enpoints
 */
import { Router } from 'express'
import { check } from 'express-validator'

import controller from '../controllers/authController'
import { checkAccess } from '../middleware/authMiddleware'

const router = Router()

/**
 * Register user request.
 */
router.post(
  '/signup',
  [
    check('login', 'User name can not be blank').notEmpty(),
    check('password', 'Password length must be 5-10 symbols').isLength({ min: 5, max: 10 }),
  ],
  controller.signUp
)

/**
 * Login request
 * Returns JWT token to client
 */
router.post('/login', controller.login)

/**
 * Session check request. Verifies if JWT token is still valid.
 */
router.post('/refresh', checkAccess, controller.refresh)

export default router
