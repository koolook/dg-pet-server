"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @file Router definition for '/article` endpoints. CRUD for Article and news feed is implemented here
 */
const express_1 = require("express");
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const articleController_1 = __importDefault(require("../controllers/articleController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use((0, express_fileupload_1.default)());
router.post('/', [authMiddleware_1.checkAccess, (0, authMiddleware_1.checkRoles)(['author'])], articleController_1.default.create);
router.put('/:id', [authMiddleware_1.checkAccess, (0, authMiddleware_1.checkRoles)(['author'])], articleController_1.default.update);
router.get('/:id', authMiddleware_1.checkToken, articleController_1.default.getById);
router.delete('/:id', authMiddleware_1.checkToken, articleController_1.default.deleteById);
// router.get('/feed', checkToken, controller.feed)
router.post('/feed', authMiddleware_1.checkToken, articleController_1.default.getManyByIds);
exports.default = router;
//# sourceMappingURL=articleRouter.js.map