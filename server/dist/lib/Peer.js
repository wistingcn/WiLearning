"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Peer = void 0;
const events_1 = require("events");
const log4js_1 = require("log4js");
const logger = log4js_1.getLogger('Peer');
class Peer extends events_1.EventEmitter {
    constructor(id, socket, room) {
        super();
        this.id = id;
        this.socket = socket;
        this.room = room;
        this.producers = new Map();
        this.transports = new Map();
        this.consumers = new Map();
        this.closed = false;
        this.joined = false;
        this.enterTime = Date.now();
        this.disconnectCheck = 0;
        logger.info('constructor() [id:"%s", socket:"%s"]', id, socket.id);
        this.address = socket.handshake.address;
        this.setMaxListeners(Infinity);
        this.handlePeer();
    }
    close() {
        logger.info('peer %s call close()', this.id);
        this.closed = true;
        this.closeResource();
        if (this.socket) {
            this.socket.disconnect(true);
        }
        if (this.intervalHandler) {
            clearInterval(this.intervalHandler);
        }
        this.emit('close');
    }
    handlePeerReconnect(socket) {
        this.socket.leave(this.room.id);
        this.socket.disconnect(true);
        logger.info('peer %s reconnnected! disconnect previous connection now.', this.id);
        this.socket = socket;
        this.socket.join(this.room.id);
        this.room.setupSocketHandler(this);
        this.handlePeer();
    }
    closeResource() {
        this.producers.forEach((producer) => {
            producer.close();
        });
        this.consumers.forEach((consumer) => {
            clearInterval(consumer.appData.intervalHandler);
            consumer.close();
        });
        this.transports.forEach((transport) => {
            transport.close();
        });
        this.transports.clear();
        this.producers.clear();
        this.consumers.clear();
    }
    handlePeer() {
        this.socket.on('disconnect', (reason) => {
            if (this.closed) {
                return;
            }
            logger.debug('"socket disconnect" event [id:%s], reason: %s', this.id, reason);
            this.disconnectCheck = 0;
            if (this.intervalHandler) {
                clearInterval(this.intervalHandler);
            }
            this.intervalHandler = setInterval(() => {
                this.checkClose();
            }, 20000);
        });
        this.socket.on('error', (error) => {
            logger.info('socket error, peer: %s, error: %s', this.id, error);
        });
    }
    checkClose() {
        if (!this.socket.connected) {
            this.disconnectCheck++;
        }
        else {
            clearInterval(this.intervalHandler);
            this.intervalHandler = null;
        }
        if (this.disconnectCheck > 6) {
            this.close();
        }
    }
    addTransport(id, transport) {
        this.transports.set(id, transport);
    }
    getTransport(id) {
        return this.transports.get(id);
    }
    getConsumerTransport() {
        return Array.from(this.transports.values())
            .find((t) => t.appData.consuming);
    }
    removeTransport(id) {
        this.transports.delete(id);
    }
    addProducer(id, producer) {
        this.producers.set(id, producer);
    }
    getProducer(id) {
        return this.producers.get(id);
    }
    removeProducer(id) {
        this.producers.delete(id);
    }
    addConsumer(id, consumer) {
        this.consumers.set(id, consumer);
    }
    getConsumer(id) {
        return this.consumers.get(id);
    }
    removeConsumer(id) {
        const consumer = this.consumers.get(id);
        if (consumer) {
            consumer.close();
            clearInterval(consumer.appData.intervalHandler);
        }
        this.consumers.delete(id);
    }
    statusReport() {
        let transportReport = new Array();
        this.transports.forEach(value => {
            transportReport.push({
                transportId: value.id,
                closed: value.closed,
            });
        });
        let producerReport = new Array();
        this.producers.forEach(value => {
            producerReport.push({
                producerId: value.id,
                closed: value.closed,
                kind: value.kind,
                type: value.type,
            });
        });
        let consumerReport = new Array();
        this.consumers.forEach(value => {
            consumerReport.push({
                consumerId: value.id,
                closed: value.closed,
                kind: value.kind,
                producerId: value.producerId,
                type: value.type,
            });
        });
        return {
            ...this.peerInfo(),
            joined: this.joined,
            closed: this.closed,
            transports: transportReport,
            producers: producerReport,
            consumers: consumerReport,
        };
    }
    peerInfo() {
        const peerInfo = {
            id: this.id,
            roler: this.roler,
            displayName: this.displayName,
            picture: this.picture,
            platform: this.platform,
            address: this.address,
            durationTime: (Date.now() - this.enterTime) / 1000,
        };
        return peerInfo;
    }
}
exports.Peer = Peer;
