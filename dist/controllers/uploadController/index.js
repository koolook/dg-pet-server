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
const UploadedFiles_1 = __importDefault(require("../../models/UploadedFiles/UploadedFiles"));
const utils_1 = require("./modules/utils");
class ArticleController {
    constructor() {
        this.uploadFile = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const newFile = yield (0, utils_1.saveFile)(req);
                if (!newFile) {
                    throw new Error('Can not create file');
                }
                res.json((0, utils_1.file2json)(newFile));
            }
            catch (error) {
                res.status(400).json(error.message);
            }
        });
        this.getFiles = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const ownerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userid;
            if (!ownerId) {
                return res.status(500).json('Internal error: user mismatch');
            }
            try {
                const files = yield UploadedFiles_1.default.find({ owner: ownerId }).sort({ name: 1 });
                const responseObj = files.map(utils_1.file2json);
                return res.json(responseObj);
            }
            catch (error) {
                return res.status(404).json('Not found');
            }
        });
        /*   deleteFiles = async (req: Request, res: Response) => {
          // const userId = req.user?.userid
          const requestedIds = req.body.ids as string[]
      
          try {
            await deleteFiles(requestedIds)
      
            res.json('OK')
          } catch (error) {
            res.status(500).json(error)
          }
        } */
    }
}
exports.default = new ArticleController();
//# sourceMappingURL=index.js.map