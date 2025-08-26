import { Router } from 'express'
import fileUpload from 'express-fileupload'

import controller from '../controllers/uploadController'
import { checkAccess, checkRoles } from '../middleware/authMiddleware'

const router = Router()

router.use(fileUpload())

// uploads a new file
router.post('/', [checkAccess, checkRoles(['author'])], controller.uploadFile)
// gets a list of uploaded files owned by current user
router.get('/', [checkAccess, checkRoles(['author'])], controller.getFiles)
// deletes specified files
router.post('/delete', [checkAccess, checkRoles(['author'])], controller.deleteFiles)

// deletes a file
// router.delete('/:id', [checkAccess, checkRoles(['author'])], controller.deleteFile)

export default router
