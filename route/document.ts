const multer = require('multer');
import express from 'express';
import {Logger} from '../lib/Logger';
const logger = new Logger('uploadRouter');
import fs from 'fs';
import { ClaDocPages, ClaRoom, ClaDocs } from '../model/model';
import crypto from 'crypto';

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const roomId = req.params.id;
        const dir = 'public/images/' + roomId + '/';
        logger.debug('dir : ', dir);
        fs.mkdir(dir, { recursive: true} , (err) => {
            if ( err ) {
                this.logger.error(err);
            }
            cb(null, dir)
        });
    },
    filename: function(req, file, cb) {
        const md5 = crypto.createHash('md5');
        const digest = md5.update(file.originalname).digest('hex');

        cb(null, digest + '.png')
    }
 })

const upload = multer({storage});

export const docRouter = express.Router();

docRouter.post('/images/:id', upload.single('file'), async (req: any, res) => {
    const roomId = req.params.id;

    let dbRoom = await ClaRoom.findOne({id: roomId});
    if ( !dbRoom ) {
        res.status(404).send(`Room ${roomId} do not existed!`);
        return;
    }

    const originalname = req.file.originalname as string;
    const index = originalname.lastIndexOf('-');
    const fileName = originalname.slice(0, index);
    const pageNum = originalname.slice(index + 1, originalname.length);

    let doc = await ClaDocs.findOne({roomId: dbRoom.id, fileName});
    if ( !doc ) {
        doc = new ClaDocs();
        doc.fileName = fileName;
        doc.roomId = dbRoom.id;
        doc.uploadTime = Date.now().toString();
        await doc.save();
    }

    const docPage = new ClaDocPages();
    docPage.page = +pageNum;
    docPage.path = req.file.path;
    docPage.doc = doc;
    await docPage.save();

    logger.debug(`fileName: ${fileName}, page number : ${pageNum}, uploadtime: ${doc.uploadTime}`);

    res.status(200).send(docPage);
});

docRouter.get('/images/:id', async (req, res) => {
    const roomId = req.params.id;
    const docs = await ClaDocs.find({roomId});
    logger.info('Room: %s, doc: %s', roomId, JSON.stringify(docs));

    res.status(200).send(docs);
});

docRouter.get('/images/:roomId/:docId', async (req, res) => {
    const docId = req.params.docId;
    const doc = await ClaDocs.findOne({id: docId});
    const pages = await ClaDocPages.find({doc});

    res.status(200).send(pages);
});
