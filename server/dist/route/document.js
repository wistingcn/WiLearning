"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.docRouter = void 0;
const multer = require('multer');
const express_1 = __importDefault(require("express"));
const log4js_1 = require("log4js");
const logger = log4js_1.getLogger('route/document');
const fs_1 = __importDefault(require("fs"));
const model_1 = require("../model/model");
const crypto_1 = __importDefault(require("crypto"));
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const roomId = req.params.id;
        const dir = 'public/images/' + roomId + '/';
        logger.debug('dir : ', dir);
        fs_1.default.mkdir(dir, { recursive: true }, (err) => {
            if (err) {
                this.logger.error(err);
            }
            cb(null, dir);
        });
    },
    filename: function (req, file, cb) {
        const md5 = crypto_1.default.createHash('md5');
        const digest = md5.update(file.originalname).digest('hex');
        cb(null, digest + '.png');
    }
});
const upload = multer({ storage });
exports.docRouter = express_1.default.Router();
exports.docRouter.post('/images/:id', upload.single('file'), async (req, res) => {
    const roomId = req.params.id;
    let dbRoom = await model_1.ClaRoom.findOne({ id: roomId });
    if (!dbRoom) {
        res.status(404).send(`Room ${roomId} do not existed!`);
        return;
    }
    const originalname = req.file.originalname;
    const index = originalname.lastIndexOf('-');
    const fileName = originalname.slice(0, index);
    const pageNum = originalname.slice(index + 1, originalname.length);
    let doc = await model_1.ClaDocs.findOne({ roomId: dbRoom.id, fileName });
    if (!doc) {
        doc = new model_1.ClaDocs();
        doc.fileName = fileName;
        doc.roomId = dbRoom.id;
        doc.uploadTime = Date.now().toString();
        await doc.save();
    }
    const docPage = new model_1.ClaDocPages();
    docPage.page = +pageNum;
    docPage.path = req.file.path;
    docPage.doc = doc;
    await docPage.save();
    logger.debug(`fileName: ${fileName}, page number : ${pageNum}, uploadtime: ${doc.uploadTime}`);
    res.status(200).send(docPage);
});
exports.docRouter.get('/images/:id', async (req, res) => {
    const roomId = req.params.id;
    const docs = await model_1.ClaDocs.find({ roomId });
    logger.info('Room: %s, doc: %s', roomId, JSON.stringify(docs));
    res.status(200).send(docs);
});
exports.docRouter.get('/images/:roomId/:docId', async (req, res) => {
    const docId = req.params.docId;
    const doc = await model_1.ClaDocs.findOne({ id: docId });
    const pages = await model_1.ClaDocPages.find({ doc });
    res.status(200).send(pages);
});
