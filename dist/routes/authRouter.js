"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @file Router definition for '/auth' enpoints
 */
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const authController_1 = __importDefault(require("../controllers/authController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
/**
 * Register user request.
 */
router.post('/signup', [
    (0, express_validator_1.check)('login', 'User name can not be blank').notEmpty(),
    (0, express_validator_1.check)('password', 'Password length must be 5-10 symbols').isLength({ min: 5, max: 10 }),
], authController_1.default.signUp);
/**
 * Login request
 * Returns JWT token to client
 */
router.post('/login', authController_1.default.login);
/**
 * Session check request. Verifies if JWT token is still valid.
 */
router.post('/refresh', authMiddleware_1.checkAccess, authController_1.default.refresh);
exports.default = router;
//# sourceMappingURL=authRouter.js.map