import { EventEmitter } from 'events';
import {Peer} from './Peer';
import {lConfig} from '../config/config'
import {types as mediasoupTypes} from 'mediasoup';
import { RoomStatus } from './defines';

import { Logger } from './Logger';
const logger = new Logger('Room');

const audioCodecs: mediasoupTypes.RtpCodecCapability = {
	kind: 'audio',
	mimeType  : 'audio/opus',
	clockRate : 48000,
	channels  : 2
};

const videoCodecs: mediasoupTypes.RtpCodecCapability = {
	kind: 'video',
	mimeType   : 'video/vp8',
	clockRate  : 90000,
}

export class Room extends EventEmitter {
	static async create(mediasoupWorker: mediasoupTypes.Worker, roomId:string ) {
		logger.info('create() [roomId:"%s"]', roomId);

		const mediaCodecs = [audioCodecs, videoCodecs];
		const mediasoupRouter = await mediasoupWorker.createRouter({ mediaCodecs });
		return new Room(roomId, mediasoupRouter);
	}

	public peers = new Map<string,Peer>();
	public closed = false;
	private bornTime = Date.now();
	private activeTime = Date.now();
	private classRoom = {
		startTime: 0,
		stopTime: 0,
		status: RoomStatus.stopped,
		logoUrl: '',
		announcementText: '',
		videoFilter: false,
	};

	constructor(
		public id: string, 
		private mediasoupRouter: mediasoupTypes.Router, 
		){
		super();
		
		logger.info('constructor() [roomId:"%s"]', id);
		this.setMaxListeners(Infinity);
	}

	public close() {
		logger.info('close() room: %s', this.id);
		this.closed = true;

		this.peers.forEach((peer) => {
			if (!peer.closed) {
				peer.close();
			}
		});

		this.peers.clear();
		this.mediasoupRouter.close();

		this.emit('close');
	}

	public handlePeer(peer: Peer) {
		logger.info('handlePeer() id: %s, address: %s', peer.id, peer.socket.handshake.address);

		peer.socket.join(this.id);
		this.setupSocketHandler(peer);
		this.peers.set(peer.id, peer);

		peer.on('close', () => {
			logger.info('%s closed, room:  %s', peer.id, this.id);
			if (this.closed) {
				return;
			}

			this._notification(peer.socket, 'peerClosed', { peerId: peer.id }, true);

			this.peers.delete(peer.id);

			if (this.checkEmpty()) {
				this.close();
			}
		});
	}

	public setupSocketHandler(peer: Peer) {
		peer.socket.on('request', (request, cb) => {
			this.setActive();

			logger.debug(
				'Peer "request" event [room:"%s", method:"%s", peerId:"%s"]',
				this.id, request.method, peer.id);

			this._handleSocketRequest(peer, request, cb)
				.catch((error) => {
					logger.error('"request" failed [error:"%o"]', error);

					cb(error);
				});
		});
	}

	public getPeer(peerId: string ) {
		return this.peers.get(peerId);
	}

	statusReport() {
		const dura = Math.floor((Date.now() - this.bornTime) / 1000);
		const lastActive = Math.floor((Date.now() - this.activeTime) / 1000);

		return {
			id: this.id,
			peers: [...this.peers.keys()],
			duration: dura,
			lastActive,
			status: this.classRoom.status,
			closed: this.closed
		};
	}

	checkDeserted() {
		if (this.checkEmpty()) {
			logger.info('room %s is empty , now close it!', this.id);
			this.close();
			return;
		}

		const lastActive = (Date.now() - this.activeTime) / 1000; // seconds
		if ( lastActive > 2 * 60 * 60 ) { // 2 hours not active
			logger.warn('room %s too long no active!, now close it, lastActive: %s', this.id, lastActive);
			//this.close();
		}
	}

	private setActive() {
		this.activeTime = Date.now();
	}

	private checkEmpty() {
		return this.peers.size === 0;
	}

	private stopClass(peer: Peer) {
		this.classRoom.stopTime = Date.now();
		this.classRoom.status = RoomStatus.stopped;

		this._notification(peer.socket, 'classStop', {
			roomId : this.id
		}, true);
	}

	private async _handleSocketRequest(peer: Peer, request, cb) {
		switch (request.method) {
			case 'getRouterRtpCapabilities':
			{
				cb(null, this.mediasoupRouter.rtpCapabilities);

				break;
			}

			case 'join':
			{
				const {
					roler,
					displayName,
					picture,
					platform,
					rtpCapabilities
				} = request.data;

				if ( peer.joined ) {
					cb(null , {joined: true});
					break;
				}

				peer.roler = roler;
				peer.displayName = displayName;
				peer.picture = picture;
				peer.platform = platform;
				peer.rtpCapabilities = rtpCapabilities;

				const peerInfos = new Array<any>();

				this.peers.forEach((joinedPeer) => {
					peerInfos.push(joinedPeer.peerInfo());

					joinedPeer.producers.forEach((producer) => {
						this._createConsumer(peer, joinedPeer, producer);
					});
				});

				cb(null, { peers: peerInfos, joined: false });

				this._notification(
					peer.socket,
					'newPeer',
					{...peer.peerInfo()},
					true
				);

				logger.debug(
					'peer joined [peer: "%s", displayName: "%s", picture: "%s", roler:"%s", platform: "%s"]',
					peer.id, displayName, picture, roler, platform);

				peer.joined = true;
				break;
			}

			case 'createWebRtcTransport':
			{
				const { forceTcp, producing, consuming } = request.data;
				const {
					maxIncomingBitrate,
					initialAvailableOutgoingBitrate
				} = lConfig.webRtcTransport;

				const transport = await this.mediasoupRouter.createWebRtcTransport({
						listenIps : lConfig.webRtcTransport.listenIps,
						enableUdp : !forceTcp,
						enableTcp : true,
						preferUdp : true,
						initialAvailableOutgoingBitrate,
						appData   : { producing, consuming }
					});

				peer.addTransport(transport.id, transport);

				cb(
					null,
					{
						id             : transport.id,
						iceParameters  : transport.iceParameters,
						iceCandidates  : transport.iceCandidates,
						dtlsParameters : transport.dtlsParameters
					});

				if (maxIncomingBitrate)
				{
					try { await transport.setMaxIncomingBitrate(maxIncomingBitrate); }
					catch (error) {}
				}

				break;
			}

			case 'connectWebRtcTransport':
			{
				const { transportId, dtlsParameters } = request.data;
				const transport = peer.getTransport(transportId);

				if (!transport)
					throw new Error(`transport with id "${transportId}" not found`);

				await transport.connect({ dtlsParameters });

				cb();

				break;
			}

			case 'restartIce':
			{
				const { transportId } = request.data;
				const transport = peer.getTransport(transportId);

				if (!transport) {
					throw new Error(`transport with id "${transportId}" not found`);
				}

				const iceParameters = await transport.restartIce();

				cb(null, { iceParameters });

				break;
			}

			case 'produce':
			{
				const { transportId, kind, rtpParameters } = request.data;
				let { appData } = request.data;
				const transport = peer.getTransport(transportId);

				if (!transport) {
					logger.error(`transport with id "${transportId}" not found`);
					cb();
					break;
				}

				appData = { ...appData, peerId: peer.id };

				const producer = await transport.produce({ kind, rtpParameters, appData });
				peer.addProducer(producer.id, producer);

				producer.on('videoorientationchange', (videoOrientation) => {
					logger.debug(
						'producer "videoorientationchange" event [producerId:"%s", videoOrientation:"%o"]',
						producer.id, videoOrientation);
				});

				logger.info('produce, peer: %s, producerId: %s', peer.id, producer.id);
				cb(null, { id: producer.id });

				this.peers.forEach((otherPeer) => {
					this._createConsumer(otherPeer, peer, producer);
				});

				break;
			}

			case 'closeProducer':
			{
				const { producerId } = request.data;
				const producer = peer.getProducer(producerId);

				if (!producer) {
					logger.error(`producer with id "${producerId}" not found`);
					cb();
					break;
				}

				logger.info('closeProducer, peer: %s, producerId: %s', peer.id, producer.id);

				producer.close();
				peer.removeProducer(producer.id);
				cb();
				break;
			}

			case 'pauseProducer':
			{
				const { producerId } = request.data;
				const producer = peer.getProducer(producerId);

				if (!producer) {
					throw new Error(`producer with id "${producerId}" not found`);
				}

				await producer.pause();
				cb();
				break;
			}

			case 'resumeProducer':
			{
				const { producerId } = request.data;
				const producer = peer.getProducer(producerId);

				if (!producer)
					throw new Error(`producer with id "${producerId}" not found`);

				await producer.resume();

				cb();

				break;
			}

			case 'pauseConsumer':
			{
				const { consumerId } = request.data;
				const consumer = peer.getConsumer(consumerId);

				if (!consumer)
					throw new Error(`consumer with id "${consumerId}" not found`);

				await consumer.pause();

				cb();

				break;
			}

			case 'resumeConsumer':
			{
				const { consumerId } = request.data;
				const consumer = peer.getConsumer(consumerId);

				if (!consumer)
					throw new Error(`consumer with id "${consumerId}" not found`);

				await consumer.resume();

				cb();

				break;
			}

			case 'requestConsumerKeyFrame':
			{
				const { consumerId } = request.data;
				const consumer = peer.getConsumer(consumerId);

				if (!consumer)
					throw new Error(`consumer with id "${consumerId}" not found`);

				await consumer.requestKeyFrame();

				cb();

				break;
			}

			case 'getProducerStats':
			{
				const { producerId } = request.data;
				const producer = peer.getProducer(producerId);

				if (!producer) {
					logger.error(`producer with id "${producerId}" not found`);
					cb(null, {closed: true});
				} else {
					const stats = await producer.getStats();
					cb(null, {closed: producer.closed, stats});
				}

				break;
			}

			case 'getTransportStats':
			{
				const { transportId } = request.data;
				const transport = peer.getTransport(transportId);

				if (!transport) {
					logger.warn('Do not find transport: %s', transportId);
					cb(null, {closed: true});
				} else {
					const stats = await transport.getStats();
					cb(null, {closed:transport.closed, stats});
				}

				break;
			}

			case 'getConsumerStats':
			{
				const { consumerId } = request.data;
				const consumer = peer.getConsumer(consumerId);

				if (!consumer) {
					logger.error(`consumer with id "${consumerId}" not found`);
					cb(null, {closed: true});
				} else {
					const stats = await consumer.getStats();
					cb(null, {closed: consumer.closed, stats});
				}

				break;
			}

			case 'closePeer' :
			{
				const { stopClass } = request.data;
				logger.info('closePeer, peer: %s, stopClass: %s', peer.id, stopClass);

				cb();

				peer.close();

				if ( stopClass ) {
					this.stopClass(peer);
				}
				break;
			}

			case 'chatMessage':
			{
				const { chatMessage } = request.data;

				this._notification(peer.socket, 'chatMessage', {
					peerId      : peer.id,
					chatMessage : chatMessage
				}, true);

				cb();

				break;
			}

			case 'syncDocInfo' :
			{
				const { info } = request.data;	
				this._notification(peer.socket, 'syncDocInfo',{
					peerId	: peer.id,
					info
				}, true);

				cb();
				break;
			}

			case 'classStart' :
			{
				const { roomId } = request.data;
				this.classRoom.startTime = Date.now();
				this.classRoom.status = RoomStatus.started;

				this._notification(peer.socket, 'classStart', {
					roomId
				}, true);

				cb();
				break;
			}

			// just close class , not producer & consumer
			case 'classStop' :
			{
				this.stopClass(peer);

				cb();
				break;
			}

			case 'roomInfo' :
			{
				cb(null, this.classRoom);
				break;
			}

			case 'changeLogo' :
			{
				const { url } = request.data;
				this.classRoom.logoUrl = url;

				this._notification(peer.socket, 'changLogo', {
					url	
				}, true);

				cb();
				break;
			}

			case 'announcementText' :
			{
				const { text } = request.data;
				this.classRoom.announcementText= text;

				this._notification(peer.socket, 'announcementText', {
					text
				}, true);

				cb();
				break;
			}

			case 'videoFilter' :
			{
				const { filter } = request.data;
				this.classRoom.videoFilter = filter ;

				this._notification(peer.socket, 'videoFilter', {
					filter
				}, true);

				cb();
				break;
			}

			case 'connectVideo' :
			{
				this._notification(peer.socket, 'connectVideo', {
					peerId: peer.id
				}, true);

				cb();
				break;
			}

			case 'disconnectVideo' :
			{
				const { toPeer } = request.data;

				this._notification(peer.socket, 'disconnectVideo', {
					toPeer
				}, true);

				cb();
				break;
			}


			case 'connectApproval' :
			{
				const { toPeer, approval } = request.data;

				this._notification(peer.socket, 'connectApproval', {
					peerId: peer.id,
					toPeer,
					approval,
				}, true);

				cb();
				break;
			}

			default: 
			{
				logger.error('unknown request.method "%s"', request.method);
				cb(500, `unknown request.method "${request.method}"`);
			}
		}
	}

	async _createConsumer(consumerPeer: Peer, producerPeer: Peer, producer: mediasoupTypes.Producer) {
		logger.debug(
			'_createConsumer() [consumerPeer:"%s", producerPeer:"%s", producer:"%s"]',
			consumerPeer.id,
			producerPeer.id,
			producer.id
		);

		if (!consumerPeer.rtpCapabilities ||
			!this.mediasoupRouter.canConsume({
					producerId      : producer.id,
					rtpCapabilities : consumerPeer.rtpCapabilities
				})
		){
			return;
		}

		// Must take the Transport the remote Peer is using for consuming.
		const transport = consumerPeer.getConsumerTransport();

		if (!transport) {
			logger.warn('_createConsumer() | Transport for consuming not found');

			return;
		}

		let consumer: mediasoupTypes.Consumer;

		try {
			consumer = await transport.consume({
					producerId      : producer.id,
					rtpCapabilities : consumerPeer.rtpCapabilities,
					paused          : producer.kind === 'video'
				});
		} catch (error) {
			logger.warn('_createConsumer() | [error:"%o"]', error);

			return;
		}

		consumerPeer.addConsumer(consumer.id, consumer);

		consumer.on('transportclose', () => {
			consumerPeer.removeConsumer(consumer.id);
		});

		consumer.on('producerclose', () => {
			consumerPeer.removeConsumer(consumer.id);
			this._notification(consumerPeer.socket, 'consumerClosed', { consumerId: consumer.id });
		});

		consumer.on('producerpause', () => {
			this._notification(consumerPeer.socket, 'consumerPaused', { consumerId: consumer.id });
		});

		consumer.on('producerresume', () =>
		{
			this._notification(consumerPeer.socket, 'consumerResumed', { consumerId: consumer.id });
		});

		consumer.on('score', (score) => {
			this._notification(consumerPeer.socket, 'consumerScore', { consumerId: consumer.id, score });
		});

		consumer.appData.intervalHandler = setInterval(() => {
			this._notification(consumerPeer.socket, 'consumerScore', { consumerId: consumer.id, score: consumer.score });
		}, 60000);

		consumer.on('layerschange', (layers) =>
		{
			this._notification(
				consumerPeer.socket,
				'consumerLayersChanged',
				{
					consumerId    : consumer.id,
					spatialLayer  : layers ? layers.spatialLayer : null,
					temporalLayer : layers ? layers.temporalLayer : null
				}
			);
		});

		try
		{
			await this._request(
				consumerPeer.socket,
				'newConsumer',
				{
					peerId         : producerPeer.id,
					kind           : producer.kind,
					producerId     : producer.id,
					id             : consumer.id,
					rtpParameters  : consumer.rtpParameters,
					type           : consumer.type,
					appData        : producer.appData,
					producerPaused : consumer.producerPaused
				}
			);

			if (producer.kind === 'video') {
				await consumer.resume();
			}

			this._notification(
				consumerPeer.socket,
				'consumerScore',
				{
					consumerId : consumer.id,
					score      : consumer.score
				}
			);
		}
		catch (error) {
			logger.warn('_createConsumer() | [error:"%o"]', error);
		}
	}

	_timeoutCallback(callback) {
		let called = false;

		const interval = setTimeout(() => {
				if (called) {
					return;
				}

				called = true;
				callback(new Error('Request timeout.'));
			},
			10000
		);

		return (...args) => {
			if (called) {
				return;
			}

			called = true;
			clearTimeout(interval);

			callback(...args);
		};
	}

	_request(socket: SocketIO.Socket, method: string, data = {}) {
		return new Promise((resolve, reject) => {
			socket.emit(
				'request',
				{ method, data },
				this._timeoutCallback((err, response) => {
					if (err) {
						reject(err);
					}
					else {
						resolve(response);
					}
				})
			);
		});
	}

	_notification(socket, method, data = {}, broadcast = false) {
		if (broadcast) {
			socket.broadcast.to(this.id).emit(
				'notification', { method, data }
			);
		}
		else {
			socket.emit('notification', { method, data });
		}
	}
}
