import { Router } from 'express'
import { checkAccess, checkRoles, checkToken } from '../middleware/authMiddleware'

import controller from '../controllers/articleController'
import fileUpload from 'express-fileupload'

const router = Router()

router.use(fileUpload())

router.post('/', [checkAccess, checkRoles(['author'])], controller.create)
router.put('/:id', [checkAccess, checkRoles(['author'])], controller.update)
router.get('/:id', checkToken, controller.getById)
router.delete('/:id', checkToken, controller.deleteById)

router.get('/feed', checkToken, controller.feed)
router.post('/feed', checkToken, controller.getManyByIds)

export default router
