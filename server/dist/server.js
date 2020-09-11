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
process.title = 'WiLearning';
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const https = __importStar(require("https"));
const http = __importStar(require("http"));
const express_1 = __importDefault(require("express"));
const Room_1 = require("./lib/Room");
const Peer_1 = require("./lib/Peer");
const typeorm_1 = require("typeorm");
const socketio = __importStar(require("socket.io"));
const yargs_1 = __importDefault(require("yargs"));
const log4js_1 = require("log4js");
log4js_1.configure('./log4js.json');
const logger = log4js_1.getLogger('Server');
const document_1 = require("./route/document");
const avatar_1 = require("./route/avatar");
const room_1 = require("./route/room");
const model_1 = require("./model/model");
const path = __importStar(require("path"));
const config_1 = require("./config/config");
const got_1 = __importDefault(require("got"));
const helmet = require('helmet');
const cors = require('cors');
const mediasoup = require("mediasoup");
const bodyParser = require('body-parser');
const compression = require('compression');
const morgan = require('morgan');
yargs_1.default.usage('Usage: $0 --cert [file] --key [file] --eth [ethname] --publicIp [ipAdress]')
    .version('Wisting-meeting v1.0')
    .demandOption(['cert', 'key'])
    .option('cert', { describe: 'ssl certificate file' })
    .option('key', { describe: 'ssl certificate key file' })
    .option('eth', { describe: 'local network interface, default "eth0"' })
    .option('publicIp', { describe: 'public ip address, default get from network' });
const certfile = yargs_1.default.argv.cert;
const keyfile = yargs_1.default.argv.key;
const localEth = yargs_1.default.argv.eth || 'eth0';
const publicIp = yargs_1.default.argv.publicIp;
[certfile, keyfile].forEach(file => {
    if (!fs.existsSync(file)) {
        logger.error('%s do not exist!', file);
        process.exit(-1);
    }
});
const tls = {
    cert: fs.readFileSync(certfile),
    key: fs.readFileSync(keyfile),
};
const app = express_1.default();
app.use(compression());
app.use(morgan('dev'));
app.use(helmet.hsts());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
const mediasoupWorkers = new Array();
let nextMediasoupWorkerIdx = 0;
const rooms = new Map();
app.locals.rooms = rooms;
let httpsServer;
let io;
async function run() {
    await getIps();
    await runMediasoupWorkers();
    await runHttpsServer();
    await runWebSocketServer();
    try {
        await typeorm_1.createConnection({
            type: 'sqlite',
            "database": "database.sqlite",
            "synchronize": true,
            entities: [
                model_1.ClaDocPages,
                model_1.ClaDocs,
                model_1.ClaRoom
            ],
        });
    }
    catch (error) {
        logger.error(error);
    }
    setInterval(() => {
        let all = 0;
        let closed = 0;
        rooms.forEach(room => {
            all++;
            if (room.closed) {
                closed++;
            }
            logger.debug(JSON.stringify(room.statusReport()));
        });
        logger.info('room total: %s, closed: %s', all, closed);
    }, 300000);
    setInterval(() => {
        rooms.forEach(room => room.checkDeserted());
    }, 10000);
}
const runHttpsServer = async () => {
    app.use('/public', express_1.default.static('public', {
        maxAge: '30d'
    }));
    app.use('/room', room_1.roomRouter);
    app.use('/docs', document_1.docRouter);
    app.use('/avatar', avatar_1.avatarRouter);
    app.use('/admin', express_1.default.static('admin'));
    app.get('/admin/*', (req, res) => {
        const indexFile = path.resolve(__dirname + '/admin/index.html');
        res.sendFile(indexFile);
    });
    app.use('/web', express_1.default.static('web'));
    app.get('/web/*', (req, res) => {
        const indexFile = path.resolve(__dirname + '/web/index.html');
        res.sendFile(indexFile);
    });
    app.use('/app', express_1.default.static('app'));
    app.get('/app/*', (req, res) => {
        const indexFile = path.resolve(__dirname + '/app/index.html');
        res.sendFile(indexFile);
    });
    app.get('*', (req, res, next) => {
        res.status(404).send({ res: '404' });
    });
    httpsServer = https.createServer(tls, app);
    httpsServer.listen(config_1.lConfig.listeningPort);
    const httpServer = http.createServer(app);
    httpServer.listen(config_1.lConfig.listeningRedirectPort);
};
const runWebSocketServer = async () => {
    io = socketio.listen(httpsServer, {
        pingTimeout: 3000,
        pingInterval: 5000,
        transports: ['websocket'],
        allowUpgrades: false,
    });
    logger.info("run websocket server....");
    io.on('connection', async (socket) => {
        const { roomId, peerId } = socket.handshake.query;
        if (!roomId || !peerId) {
            logger.warn('connection request without roomId and/or peerId');
            socket.disconnect(true);
            return;
        }
        logger.info('connection request [roomId:"%s", peerId:"%s"]', roomId, peerId);
        try {
            const room = await getOrCreateRoom(roomId);
            let peer = room.getPeer(peerId);
            if (!peer) {
                peer = new Peer_1.Peer(peerId, socket, room);
                room.handlePeer(peer);
                logger.info('new peer, %s, %s', peerId, socket.id);
            }
            else {
                peer.handlePeerReconnect(socket);
                logger.info('peer reconnect, %s, %s', peerId, socket.id);
            }
        }
        catch (error) {
            logger.error('room creation or room joining failed [error:"%o"]', error);
            socket.disconnect(true);
            return;
        }
        ;
    });
};
const runMediasoupWorkers = async () => {
    const numWorkers = os.cpus().length;
    logger.info('mediasoup version: %s, running %d mediasoup Workers...', mediasoup.version, numWorkers);
    for (let i = 0; i < numWorkers; ++i) {
        const worker = await mediasoup.createWorker({
            logLevel: config_1.lConfig.worker.logLevel,
            rtcMinPort: config_1.lConfig.worker.rtcMinPort,
            rtcMaxPort: config_1.lConfig.worker.rtcMaxPort,
            dtlsCertificateFile: certfile,
            dtlsPrivateKeyFile: keyfile
        });
        worker.on('died', () => {
            logger.error('mediasoup Worker died, exiting  in 2 seconds... [pid:%d]', worker.pid);
            setTimeout(() => process.exit(1), 2000);
        });
        mediasoupWorkers.push(worker);
    }
};
const getMediasoupWorker = () => {
    const worker = mediasoupWorkers[nextMediasoupWorkerIdx];
    if (++nextMediasoupWorkerIdx === mediasoupWorkers.length) {
        nextMediasoupWorkerIdx = 0;
    }
    return worker;
};
const getOrCreateRoom = async (roomId) => {
    let room = rooms.get(roomId);
    if (!room) {
        logger.info('creating a new Room [roomId:"%s"]', roomId);
        const mediasoupWorker = getMediasoupWorker();
        room = await Room_1.Room.create(mediasoupWorker, roomId);
        rooms.set(roomId, room);
        room.on('close', () => rooms.delete(roomId));
    }
    return room;
};
const getIps = async () => {
    const localIp = getLocalIp(localEth);
    let announcedIp = publicIp;
    if (!announcedIp) {
        const url = 'https://api.ipify.org?format=json';
        try {
            const resp = await got_1.default(url).json();
            announcedIp = resp.ip;
        }
        catch (e) {
            logger.error('get public ip error!', e.message);
        }
    }
    if (!announcedIp) {
        logger.error('Got public ip error! exit now!');
        process.exit(-1);
    }
    logger.info('localIp: %s, publicIp: %s', localIp, announcedIp);
    config_1.lConfig.webRtcTransport.listenIps = [{
            ip: localIp,
            announcedIp
        }];
};
const getLocalIp = (eth) => {
    const eths = os.networkInterfaces()[eth];
    let localIp = '';
    eths && eths.forEach(e => {
        if (e.family === 'IPv4') {
            localIp = e.address;
        }
    });
    return localIp;
};
run();
