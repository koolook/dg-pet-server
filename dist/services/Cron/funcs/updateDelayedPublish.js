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
exports.updateDelayedPublish = updateDelayedPublish;
const Articles_1 = __importDefault(require("../../../models/Articles/Articles"));
/**
 * Finds Articles with delayed publish and make publish if timestamp is passed.
 * @param io
 */
function updateDelayedPublish(io) {
    return __awaiter(this, void 0, void 0, function* () {
        const now = new Date().valueOf();
        try {
            const ids = yield Articles_1.default.find({
                publishAt: {
                    $exists: true,
                    $ne: null,
                    $lt: now,
                },
            }, { _id: 1 });
            const query = yield Articles_1.default.updateMany({
                _id: { $in: ids },
            }, {
                $set: { isPublished: true, updatedAt: now },
                $unset: { publishAt: '' },
            });
            console.log(`Cron: Articles updated : ${query.modifiedCount}`);
            // send ids using `io`
        }
        catch (error) {
            console.log(`Cron: Error updating Articles: ${error.toSting()}`);
        }
    });
}
//# sourceMappingURL=updateDelayedPublish.js.map