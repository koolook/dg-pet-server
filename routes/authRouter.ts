import { Router } from 'express'
import { check } from 'express-validator'

import controller from '../controllers/authController'
import { checkAccess, checkRoles } from '../middleware/authMiddleware'

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
router.post('/refresh', checkAccess, controller.refresh)
router.get('/test', [checkAccess, checkRoles(['admin'])], controller.test)
router.get('/user', [checkAccess, checkRoles(['user'])], controller.test)

export default router
