"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomRouter = void 0;
const express_1 = __importDefault(require("express"));
const log4js_1 = require("log4js");
const logger = log4js_1.getLogger('route/room');
const model_1 = require("../model/model");
const CryptoJs = __importStar(require("crypto-js"));
exports.roomRouter = express_1.default.Router();
exports.roomRouter.post('/createRoom', async (req, res) => {
    logger.debug('createRoom: ' + JSON.stringify(req.body));
    const { roomId, roomName, speakerPassword, attendeePassword, roomDesc } = req.body;
    let dbRoom = await model_1.ClaRoom.findOne({ id: roomId });
    if (!dbRoom) {
        dbRoom = new model_1.ClaRoom();
        dbRoom.id = roomId;
        dbRoom.name = roomName;
        dbRoom.speakerPassword = speakerPassword || '';
        dbRoom.attendeePassword = attendeePassword || '';
        dbRoom.description = roomDesc || '';
        dbRoom.createTime = Date.now().toString();
        dbRoom.lastActiveTime = Date.now().toString();
        await dbRoom.save();
    }
    res.status(200).send({ result: 'OK' });
});
exports.roomRouter.post('/updateRoom', async (req, res) => {
    logger.debug('updateRoom: ' + JSON.stringify(req.body));
    const { roomId, roomName, speakerPassword, attendeePassword, roomDesc } = req.body;
    let dbRoom = await model_1.ClaRoom.findOne({ id: roomId });
    if (dbRoom) {
        dbRoom.name = roomName;
        dbRoom.speakerPassword = speakerPassword || '';
        dbRoom.attendeePassword = attendeePassword || '';
        dbRoom.description = roomDesc || '';
        await dbRoom.save();
    }
    res.status(200).send({ result: 'OK' });
});
exports.roomRouter.get('/list', async (req, res) => {
    const rooms = await model_1.ClaRoom.find();
    res.status(200).send(rooms);
});
exports.roomRouter.get('/delete/:id', async (req, res) => {
    const roomId = req.params.id;
    await model_1.ClaRoom.delete({ id: roomId });
    res.status(200).send({ result: 'OK' });
});
exports.roomRouter.get('/detail/:id', async (req, res) => {
    const roomId = req.params.id;
    let dbRoom = await model_1.ClaRoom.findOne({ id: roomId });
    if (dbRoom) {
        res.status(200).send(dbRoom);
    }
    else {
        res.status(404).send(`room ${roomId} do not existed!`);
    }
});
exports.roomRouter.get('/active', (req, res) => {
    const rooms = req.app.locals.rooms;
    const roomReport = new Array();
    rooms.forEach(room => {
        roomReport.push(room.statusReport());
    });
    res.status(200).send(roomReport);
});
exports.roomRouter.get('/activeDetail/:id', (req, res) => {
    const roomId = req.params.id;
    const rooms = req.app.locals.rooms;
    const room = rooms.get(roomId);
    const peerReport = new Array();
    if (room) {
        const peers = room.peers;
        peers.forEach(peer => {
            peerReport.push(peer.statusReport());
        });
    }
    res.status(200).send(peerReport);
});
exports.roomRouter.get('/login/:roomId/:roler/:user/:passwd', async (req, res) => {
    const roomId = req.params.roomId;
    const roler = req.params.roler;
    const user = req.params.user;
    const passwd = req.params.passwd;
    logger.debug('%s,%s,%s,%s', roomId, roler, user, passwd);
    const dbRoom = await model_1.ClaRoom.findOne({ id: roomId });
    if (!dbRoom) {
        res.status(404).send({ code: 40411, res: 'room id do not existed!' });
        return;
    }
    let dbPasswd = '';
    if (+roler === 1) {
        dbPasswd = dbRoom.speakerPassword;
    }
    else if (+roler === 2) {
        dbPasswd = dbRoom.attendeePassword;
    }
    const cryptoPasswd = CryptoJs.MD5(dbPasswd).toString().toUpperCase();
    logger.debug('cryptoPasswd : %s', cryptoPasswd);
    if (passwd !== cryptoPasswd) {
        res.status(404).send({ code: 40412, res: 'passwd error!' });
        return;
    }
    res.status(200).send({ code: 200, res: 'ok' });
});
