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
exports.file2json = void 0;
exports.saveFile = saveFile;
exports.deleteFiles = deleteFiles;
exports.deleteRefs = deleteRefs;
const config_1 = __importDefault(require("config"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ArticleAttachmenRefs_1 = __importDefault(require("../../../models/ArticleAttachmentRefs/ArticleAttachmenRefs"));
const UploadedFiles_1 = __importDefault(require("../../../models/UploadedFiles/UploadedFiles"));
function saveFile(req) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userid;
        const file = (_b = req.files) === null || _b === void 0 ? void 0 : _b.fileData;
        if (file && userId) {
            const oldFile = yield UploadedFiles_1.default.findOne({ name: file.name, owner: userId });
            if (oldFile) {
                console.log('Using existing file');
                return oldFile;
            }
            const urlPath = path_1.default.join('/uploaded', `${userId}`, file.name);
            const savePath = path_1.default.join(config_1.default.get('root_path'), urlPath);
            fs_1.default.mkdirSync(path_1.default.join(config_1.default.get('root_path'), 'uploaded', `${userId}`), { recursive: true });
            yield file.mv(savePath);
            const newFile = new UploadedFiles_1.default({
                path: urlPath,
                name: file.name,
                md5: file.md5,
                owner: userId,
                isTemporary: true,
                size: file.size,
                type: file.mimetype,
            });
            yield newFile.save();
            console.log(`Saved file ${newFile.name} to ${savePath}`);
            return newFile;
        }
        return null;
    });
}
function deleteFiles(ids) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = { _id: { $in: ids } };
        const paths = yield UploadedFiles_1.default.find(query, { path: 1 });
        const delQuery = yield UploadedFiles_1.default.deleteMany(query);
        console.log(`Deleted file records ${delQuery.deletedCount}`);
        const rootPath = config_1.default.get('root_path');
        paths.forEach((p) => {
            fs_1.default.rmSync(path_1.default.join(rootPath, p.path), { recursive: true });
            console.log(`Deleted from disk: ${p.path}`);
        });
    });
}
function deleteRefs(refs) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`deleteRefs: ${JSON.stringify(refs)}`);
        const deleteQuery = yield ArticleAttachmenRefs_1.default.deleteMany({
            _id: { $in: refs.map((r) => r._id) },
        });
        console.log(`\tdeleteQuery: ${deleteQuery.deletedCount}`);
        const cleanupIds = yield UploadedFiles_1.default.aggregate([
            {
                $lookup: {
                    from: 'articleattachmentrefs',
                    localField: '_id',
                    foreignField: 'fileId',
                    as: 'refs',
                },
            },
            {
                $match: {
                    refs: { $size: 0 },
                },
            },
            {
                $project: {
                    _id: 1,
                },
            },
        ]);
        console.log(`Cleanup IDs: ${JSON.stringify(cleanupIds)}`);
        yield deleteFiles(cleanupIds);
    });
}
const file2json = (file) => {
    const { _id, name, path, size, type } = file;
    return {
        id: _id,
        name,
        path,
        size,
        type,
    };
};
exports.file2json = file2json;
//# sourceMappingURL=utils.js.map