import { Router } from 'express'

import controller from './authController'

const router = Router()

router.post('/signup', controller.signUp)
router.post('/login', controller.login)
router.get('/test', controller.test)

export default router
