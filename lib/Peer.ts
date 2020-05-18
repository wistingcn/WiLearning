import { EventEmitter } from 'events';
import * as socketio from 'socket.io';
import { Logger } from './Logger';
const logger = new Logger('Peer');
import { ROLE } from './defines';
import {types as mediasoupTypes} from 'mediasoup';
import {Room} from './Room';

export class Peer extends EventEmitter {
	roler: ROLE;
	producers =  new Map<string, mediasoupTypes.Producer>();
	transports = new Map<string, mediasoupTypes.WebRtcTransport>();
	consumers = new Map<string, mediasoupTypes.Consumer>();
	closed = false;
	joined = false;
	displayName: string;
	picture: string;
	platform: string;
	address: string;
	enterTime = Date.now();

	disconnectCheck = 0;
	intervalHandler;

	rtpCapabilities: mediasoupTypes.RtpCapabilities;

	constructor(
		public id: string, 
		public socket: socketio.Socket,
		public room: Room) {

		super();

		logger.info('constructor() [id:"%s", socket:"%s"]', id, socket.id);

		this.address = socket.handshake.address;
		this.setMaxListeners(Infinity);
		this.handlePeer();
	}

	close() {
		logger.info('peer %s call close()', this.id);

		this.closed = true;
		this.closeResource();

		if (this.socket){
			this.socket.disconnect(true);
		}

		if ( this.intervalHandler ) {
			clearInterval(this.intervalHandler);
		}
		this.emit('close');
	}

	public handlePeerReconnect(socket: socketio.Socket) {
		this.socket.leave(this.room.id);
		this.socket.disconnect(true);
		logger.info('peer %s reconnnected! disconnect previous connection now.', this.id);

		this.socket = socket;
		this.socket.join(this.room.id);
		this.room.setupSocketHandler(this);
		this.handlePeer();
	}

	private closeResource() {
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

	private handlePeer() {
		this.socket.on('disconnect', (reason) => {
			if (this.closed) {
				return;
			}
			logger.debug('"socket disconnect" event [id:%s], reason: %s', this.id, reason);


			this.disconnectCheck = 0;
			if ( this.intervalHandler ) {
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

	public checkClose() {
		if (!this.socket.connected) {
			this.disconnectCheck++;
		} else {
			clearInterval(this.intervalHandler);
			this.intervalHandler = null;
		}

		if ( this.disconnectCheck > 6 ) {
			this.close();
		}
	}

	addTransport(id: string, transport: mediasoupTypes.WebRtcTransport) {
		this.transports.set(id, transport);
	}

	getTransport(id: string) {
		return this.transports.get(id);
	}

	getConsumerTransport() {
		return Array.from(this.transports.values())
			.find((t: any) => t.appData.consuming);
	}

	removeTransport(id: string) {
		this.transports.delete(id);
	}

	addProducer(id: string, producer: mediasoupTypes.Producer) {
		this.producers.set(id, producer);
	}

	getProducer(id: string) {
		return this.producers.get(id);
	}

	removeProducer(id: string) {
		this.producers.delete(id);
	}

	addConsumer(id: string, consumer: mediasoupTypes.Consumer) {
		this.consumers.set(id, consumer);
	}

	getConsumer(id: string) {
		return this.consumers.get(id);
	}

	removeConsumer(id: string) {
		const consumer = this.consumers.get(id);
		if ( consumer ) {
			consumer.close();
			clearInterval(consumer.appData.intervalHandler);
		}
		this.consumers.delete(id);
	}

	statusReport() {
		let transportReport = new Array<any>();
		this.transports.forEach(value => {
			transportReport.push({
				transportId: value.id,
				closed: value.closed,
			});
		});

		let producerReport = new Array<any>();
		this.producers.forEach(value => {
			producerReport.push({
				producerId: value.id,
				closed: value.closed,
				kind: value.kind,
				type: value.type,
			});
		});

		let consumerReport = new Array<any>();
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
			id          : this.id,
			roler		: this.roler,
			displayName : this.displayName,
			picture     : this.picture,
			platform	: this.platform,
			address		: this.address,
			durationTime	: (Date.now() -  this.enterTime) / 1000,
		};

		return peerInfo;
	}
}
