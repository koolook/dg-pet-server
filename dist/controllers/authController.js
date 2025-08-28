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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_1 = __importDefault(require("config"));
const express_validator_1 = require("express-validator");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Users_1 = __importDefault(require("../models/Users/Users"));
class AuthController {
    constructor() {
        this.signUp = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                // handle validation results
                const result = (0, express_validator_1.validationResult)(req);
                if (!result.isEmpty()) {
                    return res.status(400).json({
                        message: 'Invalid user data provided',
                        result,
                    });
                }
                const { login, password } = req.body;
                // check user exists
                const existingUser = yield Users_1.default.findOne({ login });
                if (existingUser) {
                    console.log(`User ${login} already exists`);
                    return res.status(400).json({ message: `User ${login} already exists` });
                }
                // hash password
                const hash = bcryptjs_1.default.hashSync(password, 7);
                // create and save user document
                const newUser = new Users_1.default({ login, hash, roles: ['user', 'admin'] });
                yield newUser.save();
                res.json({ message: `User ${login} created` });
            }
            catch (error) {
                res.status(400).json({ message: 'Error creating user', error });
            }
        });
        this.login = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { login, password } = req.body;
                // check user exists
                const user = yield Users_1.default.findOne({ login });
                if (!user) {
                    console.log(`User ${login} does not exist`);
                    return res.status(400).json({ message: `User ${login} does not exist` });
                }
                const isAuthorized = bcryptjs_1.default.compareSync(password, user.hash);
                if (!isAuthorized) {
                    console.log(`Access denied to user ${login}`);
                    return res.status(400).json({ message: `Access denied to user ${login}` });
                }
                const token = jsonwebtoken_1.default.sign({ userid: user._id, roles: user.roles }, config_1.default.get('jwtSecret'), {
                    expiresIn: '5d',
                });
                res.json({ token, id: user._id, login: user.login, roles: user.roles });
            }
            catch (error) {
                res.status(400).json({ message: 'Error logging in', error });
            }
        });
        this.refresh = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const user = yield Users_1.default.findOne({ _id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userid });
            if (!user) {
                console.log('User does not exist');
                return res.status(400).json({ message: 'User does not exist' });
            }
            res.json(Object.assign(Object.assign({}, req.user), { login: user.login }));
        });
    }
}
exports.default = new AuthController();
//# sourceMappingURL=authController.js.map