/*
	 * Copyright (c) 2020 Wisting Team. <linewei@gmail.com>
	 *
	 * This program is free software: you can use, redistribute, and/or modify
	 * it under the terms of the GNU Affero General Public License, version 3
	 * or later ("AGPL"), as published by the Free Software Foundation.
	 *
	 * This program is distributed in the hope that it will be useful, but WITHOUT
	 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
	 * FITNESS FOR A PARTICULAR PURPOSE.
	 *
	 * You should have received a copy of the GNU Affero General Public License
	 * along with this program. If not, see <http://www.gnu.org/licenses/>.
*/
import express from 'express';
import { getLogger } from 'log4js';
const logger = getLogger('route/room');

import { ClaRoom } from '../model/model';
import { Room } from '../lib/Room';
import * as CryptoJs from 'crypto-js';


export const roomRouter = express.Router();

roomRouter.post('/createRoom', async (req: any, res) => {
    logger.debug('createRoom: ' + JSON.stringify(req.body));

    const { roomId, roomName, speakerPassword, attendeePassword, roomDesc } = req.body;

    let dbRoom = await ClaRoom.findOne({id: roomId});
    if (!dbRoom) {
        dbRoom =  new ClaRoom();
        dbRoom.id = roomId;
        dbRoom.name = roomName;
        dbRoom.speakerPassword = speakerPassword || '';
        dbRoom.attendeePassword = attendeePassword || '';
        dbRoom.description = roomDesc || '';
        dbRoom.createTime = Date.now().toString();
        dbRoom.lastActiveTime = Date.now().toString();
        await dbRoom.save();
    }

    res.status(200).send({result: 'OK'});
});

roomRouter.post('/updateRoom', async (req: any, res) => {
    logger.debug('updateRoom: ' + JSON.stringify(req.body));

    const { roomId, roomName, speakerPassword, attendeePassword, roomDesc } = req.body;

    let dbRoom = await ClaRoom.findOne({id: roomId});
    if (dbRoom) {
        dbRoom.name = roomName;
        dbRoom.speakerPassword = speakerPassword || '';
        dbRoom.attendeePassword = attendeePassword || '';
        dbRoom.description = roomDesc || '';
        await dbRoom.save();
    }

    res.status(200).send({result: 'OK'});
});

roomRouter.get('/list', async (req, res) => {
    const rooms = await ClaRoom.find();
    res.status(200).send(rooms);
});

roomRouter.get('/delete/:id', async(req, res) => {
    const roomId = req.params.id;
    await ClaRoom.delete({id: roomId});
    res.status(200).send({result: 'OK'});
});

roomRouter.get('/detail/:id', async (req, res) => {
    const roomId = req.params.id;
    let dbRoom = await ClaRoom.findOne({id: roomId});

    if ( dbRoom ) {
        res.status(200).send(dbRoom);
    } else {
        res.status(404).send(`room ${roomId} do not existed!`);
    }

});

roomRouter.get('/active', (req, res) => {
    const rooms = req.app.locals.rooms as Map<string, Room>;
    const roomReport = new Array<any>();

    rooms.forEach(room => {
        roomReport.push(room.statusReport());
    });

    res.status(200).send(roomReport);
});

roomRouter.get('/activeDetail/:id', (req, res) => {
    const roomId = req.params.id;
    const rooms = req.app.locals.rooms as Map<string, Room>;
    const room = rooms.get(roomId);
    const peerReport = new Array<any>();

    if ( room ) {
        const peers = room.peers;
        peers.forEach(peer => {
            peerReport.push(peer.statusReport());
        });
    }

    res.status(200).send(peerReport);
})

roomRouter.get('/login/:roomId/:roler/:user/:passwd', async (req, res) => {
    const roomId = req.params.roomId;
    const roler = req.params.roler;
    const user	= req.params.user;
    const passwd = req.params.passwd;

    logger.debug('%s,%s,%s,%s', roomId, roler, user, passwd);

    const dbRoom = await ClaRoom.findOne({id: roomId});
    if ( !dbRoom ) {
        res.status(404).send({code: 40411, res: 'room id do not existed!'});
        return;
    }

    let dbPasswd = '';
    if (+roler === 1 ) {    //Speaker
        dbPasswd = dbRoom.speakerPassword;
    } else if (+roler === 2) { // Attendee
        dbPasswd = dbRoom.attendeePassword;
    }

    const cryptoPasswd = CryptoJs.MD5(dbPasswd).toString().toUpperCase();
    logger.debug('cryptoPasswd : %s', cryptoPasswd);

    if (passwd !== cryptoPasswd ) {
        res.status(404).send({code: 40412, res: 'passwd error!'});
        return;
    }

    res.status(200).send({code: 200, res: 'ok'});
});
