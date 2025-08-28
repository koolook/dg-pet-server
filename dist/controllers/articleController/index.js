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
const mongodb_1 = require("mongodb");
const ArticleAttachmenRefs_1 = __importDefault(require("../../models/ArticleAttachmentRefs/ArticleAttachmenRefs"));
const Articles_1 = __importDefault(require("../../models/Articles/Articles"));
const utils_1 = require("../uploadController/modules/utils");
const imageUtils_1 = require("./modules/imageUtils");
const article2json = (article) => {
    const { updatedAt, imageUrl, publishAt } = article;
    const attachments = article.attachments && Array.isArray(article.attachments)
        ? article.attachments.map((a) => (0, utils_1.file2json)(a))
        : undefined;
    return Object.assign({ id: article._id, title: article.title, body: article.body, createdAt: article.createdAt, isPublished: article.isPublished, author: article.authorName }, { updatedAt, imageUrl, publishAt, attachments });
};
class ArticleController {
    constructor() {
        this.create = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { title, body } = req.body;
            console.log(`Create new article: ${JSON.stringify(req.body)}`);
            const toPublish = req.body.publish === 'true';
            const publishAt = req.body.publishAt ? Number.parseInt(req.body.publishAt, 10) : null;
            const attachmentIds = req.body.attachments ? JSON.parse(req.body.attachments) : null;
            try {
                const imageId = yield (0, imageUtils_1.insertImage)(req);
                // create new article
                const newArticle = new Articles_1.default({
                    title,
                    body,
                    imageId: imageId ? new mongodb_1.ObjectId(imageId) : null,
                    authorId: new mongodb_1.ObjectId((_a = req.user) === null || _a === void 0 ? void 0 : _a.userid),
                    createdAt: new Date().valueOf(),
                    isPublished: toPublish && !publishAt,
                });
                if (toPublish && publishAt) {
                    newArticle.publishAt = publishAt;
                }
                console.log('Saving...');
                yield newArticle.save();
                const articleId = newArticle._id;
                const refsToCreate = attachmentIds === null || attachmentIds === void 0 ? void 0 : attachmentIds.map((id) => ({
                    articleId: new mongodb_1.ObjectId(articleId),
                    fileId: new mongodb_1.ObjectId(id),
                }));
                if (refsToCreate) {
                    yield ArticleAttachmenRefs_1.default.create(refsToCreate);
                }
                console.log('Done');
                return res.json({ id: articleId });
            }
            catch (error) {
                console.log('Failed');
                console.log(error.message);
                return res.status(500).json({
                    name: error.name,
                    code: error.code,
                });
            }
        });
        this.update = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const articleId = req.params.id;
            // TODO: see if userId check against Article.authorId is needed
            // const userId = req.user?.userid
            const { title, body, removeImage } = req.body;
            const set = {};
            const unset = {};
            const attachmentIds = req.body.attachments ? JSON.parse(req.body.attachments) : [];
            try {
                const article = yield Articles_1.default.findOne({ _id: articleId });
                if (!article) {
                    return res.status(404).json('Not found');
                }
                if (title) {
                    set.title = title;
                }
                if (body) {
                    set.body = body;
                }
                const oldImageId = article.imageId;
                const imageId = removeImage ? null : yield (0, imageUtils_1.insertImage)(req);
                if (imageId) {
                    set.imageId = imageId;
                }
                if (removeImage) {
                    unset.imageId = '';
                }
                if (req.body.publish !== undefined) {
                    const toPublish = req.body.publish === 'true';
                    const publishAt = req.body.publishAt ? Number.parseInt(req.body.publishAt, 10) : null;
                    set.isPublished = toPublish && !publishAt;
                    if (toPublish && publishAt) {
                        set.publishAt = publishAt;
                    }
                    else {
                        unset.publishAt = '';
                    }
                }
                const query = yield Articles_1.default.updateOne({ _id: articleId }, {
                    $set: Object.assign(Object.assign({}, set), { updatedAt: new Date().valueOf() }),
                    $unset: unset,
                });
                console.log(`Updated: ${JSON.stringify({ _id: articleId, modified: query.modifiedCount })}`);
                if (oldImageId && (removeImage || imageId)) {
                    yield (0, imageUtils_1.deleteImage)(oldImageId);
                }
                // deal with attachments
                const currentRefs = yield ArticleAttachmenRefs_1.default.find({ articleId }, { articleId: 1, fileId: 1 });
                console.log(`>>> Current refs: ${JSON.stringify(currentRefs.map((r) => r.fileId))}`);
                console.log(`>>> attachmentIds: ${JSON.stringify(attachmentIds)}`);
                const toDelete = currentRefs === null || currentRefs === void 0 ? void 0 : currentRefs.filter((ref) => {
                    return attachmentIds.findIndex((aId) => aId.toString() === ref.fileId.toString()) === -1;
                });
                console.log(`Refs to delete: ${JSON.stringify(toDelete)}`);
                const toAppend = attachmentIds
                    .filter((aId) => {
                    return currentRefs.findIndex((ref) => ref.fileId.toString() === aId.toString()) === -1;
                })
                    .map((fileId) => ({ articleId: new mongodb_1.ObjectId(articleId), fileId: new mongodb_1.ObjectId(fileId) }));
                console.log(`Refs to append: ${JSON.stringify(toAppend)}`);
                yield ArticleAttachmenRefs_1.default.create(toAppend);
                if (toDelete.length > 0) {
                    yield (0, utils_1.deleteRefs)(toDelete);
                }
                res.json('OK');
            }
            catch (error) {
                res.status(400).json({ message: `Error updating article: ${error.message}` });
            }
        });
        this.getById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const _id = req.params.id;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userid;
            try {
                const article = yield Articles_1.default.findOne({ _id });
                if (article && (article.isPublished || (userId && article.authorId.toString() === userId))) {
                    return res.json(article2json(article));
                }
            }
            catch (error) {
                res.status(404).json({ message: 'Article is not available' });
            }
        });
        this.getManyByIds = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userid;
            const requestedIds = req.body.ids;
            try {
                const objIds = requestedIds === null || requestedIds === void 0 ? void 0 : requestedIds.map((id) => new mongodb_1.ObjectId(id));
                const joinAttachmentsPipeline = [
                    {
                        $lookup: {
                            from: 'articleattachmentrefs',
                            localField: '_id',
                            foreignField: 'articleId',
                            as: 'articleToRef',
                        },
                    },
                    {
                        $unwind: { path: '$articleToRef', preserveNullAndEmptyArrays: true },
                    },
                    {
                        $lookup: {
                            from: 'uploadedfiles',
                            localField: 'articleToRef.fileId',
                            foreignField: '_id',
                            as: 'attachment',
                        },
                    },
                    {
                        $unwind: { path: '$attachment', preserveNullAndEmptyArrays: true },
                    },
                    {
                        $group: {
                            _id: '$_id',
                            attachments: { $push: '$attachment' },
                            authorId: { $first: '$authorId' },
                            title: { $first: '$title' },
                            body: { $first: '$body' },
                            isPublished: { $first: '$isPublished' },
                            publishAt: { $first: '$publishAt' },
                            createdAt: { $first: '$createdAt' },
                            updatedAt: { $first: '$updatedAt' },
                            imageId: { $first: '$imageId' },
                        },
                    },
                ];
                const joinAuthorPipline = [
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'authorId',
                            foreignField: '_id',
                            as: 'author',
                        },
                    },
                    {
                        $set: {
                            authorName: {
                                $first: '$author.login',
                            },
                        },
                    },
                ];
                const joinImagesPipline = [
                    {
                        $lookup: {
                            from: 'images',
                            localField: 'imageId',
                            foreignField: '_id',
                            as: 'image',
                        },
                    },
                    {
                        $set: {
                            imageUrl: {
                                $first: '$image.path',
                            },
                        },
                    },
                ];
                const articles = yield Articles_1.default.aggregate([
                    {
                        $match: {
                            $and: [
                                (objIds === null || objIds === void 0 ? void 0 : objIds.length) > 0 ? { _id: { $in: objIds } } : {},
                                { $or: [{ isPublished: true }, ...(userId ? [{ authorId: new mongodb_1.ObjectId(userId) }] : [])] },
                            ],
                        },
                    },
                    { $sort: { createdAt: -1 } },
                    ...joinAttachmentsPipeline,
                    ...joinAuthorPipline,
                    ...joinImagesPipline,
                ]);
                return res.json(articles.map((article) => article2json(article)));
            }
            catch (error) {
                return res.status(404).json({ message: error.message });
            }
        });
        this.deleteById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const _id = req.params.id;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userid;
            if (!userId) {
                return res.status(401).json({
                    message: 'Not authorized',
                });
            }
            try {
                const article = yield Articles_1.default.findOne({ _id });
                if (!article) {
                    return res.status(404).json({ message: 'not found' });
                }
                if (article.authorId.toString() !== userId) {
                    return res.status(401).json({ message: 'Author mismatch' });
                }
                const oldImageId = article.imageId;
                const deleted = yield Articles_1.default.deleteOne({ _id });
                if (deleted) {
                    console.log(`Deleted ${_id}`);
                    if (oldImageId) {
                        yield (0, imageUtils_1.deleteImage)(oldImageId);
                    }
                    const refsToDelete = yield ArticleAttachmenRefs_1.default.find({ articleId: _id });
                    console.log(`Refs to delete: ${JSON.stringify(refsToDelete)}`);
                    yield (0, utils_1.deleteRefs)(refsToDelete);
                    return res.json('OK');
                }
            }
            catch (error) {
                return res.status(404).json({ message: 'Could not delete anything' });
            }
        });
    }
}
exports.default = new ArticleController();
//# sourceMappingURL=index.js.map