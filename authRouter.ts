import { Router } from 'express'
import { check } from 'express-validator'

import controller from './authController'

const router = Router()

router.post(
  '/signup',
  [
    check('login', 'User name can not be blank').notEmpty(),
    check('password', 'Password length must be 5-10 symbols').isLength({ min: 5, max: 10 }),
  ],
  controller.signUp
)
router.post('/login', controller.login)
router.get('/test', controller.test)

export default router
