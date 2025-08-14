import { Router } from 'express'
import { checkAccess, checkRoles, checkToken } from '../middleware/authMiddleware'

import controller from '../controllers/articleController'
import fileUpload from 'express-fileupload'

const router = Router()

router.use(fileUpload())

router.get('/feed', checkToken, controller.feed)

router.post('/update', [checkAccess, checkRoles(['author'])], controller.update)

export default router
