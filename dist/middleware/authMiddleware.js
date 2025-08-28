"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRoles = exports.checkToken = exports.checkAccess = void 0;
const config_1 = __importDefault(require("config"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Authentication middleware.
 * Verifies JWT provided in headers.
 * If verification passes token data is attached to
 * request object so it can be used in request handlers.
 * If verification fails auth error is sent in response.
 * @param req
 * @param res
 * @param next
 * @returns
 */
const checkAccess = (req, res, next) => {
    var _a;
    try {
        if (req.method === 'OPTIONS')
            next();
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            console.log('Access token is empty');
            return res.status(401).json({
                message: 'Access token is empty',
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.get('jwtSecret'));
        if (typeof decoded === 'object')
            req.user = decoded;
        return next();
    }
    catch (error) {
        res.status(401).json({
            message: 'Access denied',
            error,
        });
    }
};
exports.checkAccess = checkAccess;
/**
 * Authentication middleware.
 * A weaker version of `checkAccess`.
 * If JWT is provided it checks the token and attach token data to request.
 * If JST is absent it just passes.
 * As the result reuqest handler can implement anonymous access.
 * - user data present - authorized
 * - no user data - anonymous
 *
 * @param req
 * @param res
 * @param next
 * @returns
 */
const checkToken = (req, res, next) => {
    var _a;
    try {
        if (req.method === 'OPTIONS')
            next();
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            return next();
        }
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.get('jwtSecret'));
        if (typeof decoded === 'object')
            req.user = decoded;
        return next();
    }
    catch (error) {
        res.status(401).json({
            message: 'Access denied',
            error,
        });
    }
};
exports.checkToken = checkToken;
/**
 * Autorisation middleware factory
 * Produces a middlware that checks if request contains specific user roles
 * Use this strictly after `checkAccess` middleware
 * @param allowedRoles - array of roles resulting middleware will check
 * @returns
 */
const checkRoles = (allowedRoles) => (req, res, next) => {
    var _a, _b;
    console.log(`User: ${(_a = req.user) === null || _a === void 0 ? void 0 : _a.userid}`);
    const userRoles = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.roles) || ['user'];
    let hasRole = false;
    userRoles.forEach((role) => __awaiter(void 0, void 0, void 0, function* () {
        if (allowedRoles.includes(role)) {
            hasRole = true;
        }
    }));
    if (!hasRole) {
        return res.status(401).json({
            message: 'Insufficient access rights',
        });
    }
    return next();
};
exports.checkRoles = checkRoles;
//# sourceMappingURL=authMiddleware.js.map