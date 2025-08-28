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
exports.insertImage = insertImage;
exports.deleteImage = deleteImage;
const config_1 = __importDefault(require("config"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const Articles_1 = __importDefault(require("../../../models/Articles/Articles"));
const Images_1 = __importDefault(require("../../../models/Images/Images"));
function insertImage(req) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if ((_a = req.files) === null || _a === void 0 ? void 0 : _a.coverImage) {
            const file = req.files.coverImage;
            try {
                const md5 = file.md5;
                const oldImage = yield Images_1.default.findOne({ md5 });
                if (oldImage) {
                    console.log('Using existing image');
                    return oldImage._id;
                }
                const urlPath = path_1.default.join('/uploaded', md5 + path_1.default.extname(file.name));
                const savePath = path_1.default.join(config_1.default.get('root_path'), urlPath);
                yield file.mv(savePath);
                const newImage = new Images_1.default({ path: urlPath, md5 });
                yield newImage.save();
                console.log(`Saved image ${newImage._id} to ${savePath}`);
                return newImage._id;
            }
            catch (error) {
                console.log(`File upload error: ${error.message}`);
                console.log('Continue without image...');
            }
        }
        return null;
    });
}
function deleteImage(_id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const image = yield Images_1.default.findOne({ _id });
            if (!image) {
                return;
            }
            const imageOwners = yield Articles_1.default.find({ imageId: _id });
            if (imageOwners.length === 0) {
                const filePath = path_1.default.join(config_1.default.get('root_path'), image.path);
                yield Images_1.default.deleteOne({ _id });
                fs_1.default.rmSync(filePath, { recursive: false });
                console.log(`Image ${_id} and file ${filePath} are deleted`);
            }
        }
        catch (error) {
            console.log(`Error removing image: ${error.message}`);
        }
    });
}
//# sourceMappingURL=imageUtils.js.map