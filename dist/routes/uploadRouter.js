"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const uploadController_1 = __importDefault(require("../controllers/uploadController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use((0, express_fileupload_1.default)());
// uploads a new file
router.post('/', [authMiddleware_1.checkAccess, (0, authMiddleware_1.checkRoles)(['author'])], uploadController_1.default.uploadFile);
// gets a list of uploaded files owned by current user
// router.get('/', [checkAccess, checkRoles(['author'])], controller.getFiles)
// deletes specified files
// router.post('/delete', [checkAccess, checkRoles(['author'])], controller.deleteFiles)
// deletes a file
// router.delete('/:id', [checkAccess, checkRoles(['author'])], controller.deleteFile)
exports.default = router;
//# sourceMappingURL=uploadRouter.js.map