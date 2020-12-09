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
import { Injectable } from '@angular/core';
import { SignalingService } from './signaling.service';
import { MediaService, DisplayMediaScreenShare } from './media.service';
import { LoggerService } from './logger.service';
import { EventbusService, IEventType, EventType } from './eventbus.service';
import { ProfileService } from './profile.service';
import { WlMedia, WlPeer, RequestMethod, ROLE, CONNECT_VIDEO_STATUS, makeRandomString } from '../defines';
import { WlClassroom, RoomStatus, WlMediaSource, WlBoardComp } from '../defines';
import { SIMULCASTENCODING, SCREENSHARE_CONSTRAINTS, VIDEORESOLUTION} from '../defines';
import { types as mediaTypes } from 'mediasoup-client';
import * as hark from 'hark';
import 'webrtc-adapter';
import { audioConstrain, videoConstrain } from '../config';
import { StatsService } from './stats.service';

@Injectable({
  providedIn: 'root'
})
export class PeerService {
  public localCam: WlMedia;
  public localMic: WlMedia;
  public pScreen: DisplayMediaScreenShare;
  public peerStreams: WlMedia[] = [];
  public peersInfo: WlPeer[] = [];
  public producerMap = new Map<string, mediaTypes.Producer>();
  public cameraStreams = [];
  public screenStreams: WlMedia[] = [];
  public mediaStreams: WlMedia[] = [];
  public toggleSide = false;

  public networkType;

  public hasInit = false;

  constructor(
    private signaling: SignalingService,
    private media: MediaService,
    private logger: LoggerService,
    private eventbus: EventbusService,
    private profile: ProfileService,
    private stats: StatsService,
  ) {
    this.eventbus.socket$.subscribe(async (event: IEventType) => {
      const { type } = event;
      if (type === EventType.socket_connected) {
        if (!this.hasInit) {
          await this.init();
          await this.roomUpdate();
          await this.connectMediaServer();
        } else {
          await this.connectMediaServer(true);
          await this.iceRestart();
        }
      }
    });

    this.eventbus.media$.subscribe(async (event: IEventType) => {
      const { type } = event;

      if ( type === EventType.media_newPeer ) {
        this.newPeer(event.data);
      }

      if ( type === EventType.media_peerClose ) {
        this.peerClosed(event.data);
      }

      if ( type === EventType.media_consumerClosed ) {
        this.consumerClosed(event.data);
      }

      if ( type === EventType.media_newConsumer ) {
        this.newConsumer(event.data);
      }
    });

    this.eventbus.peer$.subscribe((event: IEventType) => {
      if (event.type === EventType.peer_changeRoler) {
        const { peerId , roler } = event.data;
        this.peersInfo.forEach(peer => {
          if (peer.id === peerId ) {
            peer.roler = roler;
          }
        });
      }
    });
   }

  private async iceRestart() {
    this.logger.debug('iceRestart begin...');
    const  paramsS = await this.signaling.sendIceRestart(this.media.sendTransport.id) as any;
    await this.media.sendTransport.restartIce({iceParameters: paramsS.iceParameters});

    const paramsR = await this.signaling.sendIceRestart(this.media.recvTransport.id) as any;
    await this.media.recvTransport.restartIce({iceParameters: paramsR.iceParameters});
  }

  private async newConsumer(data: any) {
    const { peerId, appData, id, producerId } = data;

    const consumer = await this.media.recvTransport.consume({
        ...data,
        appData : { ...appData, peerId, producerId }
      });

    consumer.on('transportclose', () => {
      this.logger.warn('transportclose !');
    });

    this.logger.debug('new consumer, kind: %s, consumer id: %s, producerId: %s, peerId: %s, appData: %s',
      consumer.kind, consumer.id, producerId, peerId, appData.source);

    const appdata = appData.source as string;
    const appArray = appdata.split('_'); // 0 - peerId, 1 - source ; 2-type
    const source = appArray[1]; // source as source id

    this.logger.debug('appdata, peerId: %s, source: %s, type: %s', appArray[0], appArray[1], appArray[2]);

    switch (source) {
      case WlMediaSource.cameramic:
        this.newConsumerCam(peerId, consumer, source);
        break;
      case WlMediaSource.screen:
        this.newConsumerScreen(peerId, consumer, source);
        break;
      case WlMediaSource.media:
        this.newCosumerMedia(peerId, consumer, source);
        break;
    }
  }

  private newConsumerCam(peerId: string, consumer: mediaTypes.Consumer, source: string) {
    const peerInfo = this.getPeerInfo(peerId);
    peerInfo.connectVideoStatus = CONNECT_VIDEO_STATUS.Connected;

    let stream = null;
    const existStream = this.peerStreams.find(ps => (ps.source === source) && (ps.peer.id === peerId));

    if ( existStream ) {
      stream = existStream;
    } else {
      stream = new WlMedia();
      this.peerStreams = [...this.peerStreams, stream];
      stream.source = source;

      peerInfo.camStream = stream;
      stream.peer = peerInfo;
    }

    stream.addTrack(consumer.track);

    if ( consumer.kind === 'video' ) {
      stream.videoConsumer = consumer;
      stream.toggleSide = this.toggleSide;
      this.updateCameraStreams();

      this.stats.setVideoConsumer(consumer);
    } else {
      stream.audioConsumer = consumer;
      this.setupVolumeDetect(stream);

      this.stats.setAudioConsumer(consumer);
    }

    // do not consumer audio produced by itself
    if ( peerId === this.profile.me.id && consumer.kind === 'audio') {
      stream.getAudioTracks()[0].enabled = false;
    }
  }

  private newConsumerScreen(peerId: string, consumer: mediaTypes.Consumer, source: string) {
    const peerInfo = this.getPeerInfo(peerId);

    let stream = null;

    if (peerInfo.screenStream) {
      stream = peerInfo.screenStream;
    } else {
      stream = new WlMedia();
      stream.source = source;
      peerInfo.screenStream = stream;
      stream.peer = peerInfo;
      this.peerStreams = [...this.peerStreams, stream];
    }

    stream.addTrack(consumer.track);
    if (consumer.kind === 'video') {
      stream.videoConsumer = consumer;
    } else {
      stream.audioConsumer = consumer;
    }

    // do not consumer audio produced by itself
    if ( peerId === this.profile.me.id && consumer.kind === 'audio') {
      stream.getAudioTracks()[0].enabled = false;
    }

    this.profile.switchBoardComponent(WlBoardComp.sharescreen);
    this.updateScreenStreams();

  }

  private newCosumerMedia(peerId: string, consumer: mediaTypes.Consumer, source: string) {
    // not consume media produce by me
    if (peerId === this.profile.me.id ) {
      consumer.close();
      return;
    }

    const peerInfo = this.getPeerInfo(peerId);

    let stream = null;

    if (peerInfo.mediaStream) {
      stream = peerInfo.mediaStream;
    } else {
      stream = new WlMedia();
      stream.source = source;
      peerInfo.mediaStream = stream;
      stream.peer = peerInfo;
      this.peerStreams = [...this.peerStreams, stream];
    }

    stream.addTrack(consumer.track);
    if (consumer.kind === 'video') {
      stream.videoConsumer = consumer;
    } else {
      stream.audioConsumer = consumer;
    }

    // do not consumer audio produced by itself
    if ( peerId === this.profile.me.id && consumer.kind === 'audio') {
      stream.getAudioTracks()[0].enabled = false;
    }

    this.updateMediaStreams();
    this.profile.switchBoardComponent(WlBoardComp.sharemedia);
  }

  private updateScreenStreams() {
    this.screenStreams = [];
    this.peerStreams.forEach(stream => {
      if (stream.source === WlMediaSource.screen && stream.videoConsumer) {
        this.screenStreams.push(stream);
      }
    });
  }

  private updateMediaStreams() {
    this.mediaStreams = [];
    this.peerStreams.forEach(stream => {
      if (stream.source === WlMediaSource.media && stream.videoConsumer) {
        this.mediaStreams.push(stream);
      }
    });
  }

  public updateCameraStreams() {
    this.cameraStreams = [];
    const tmpStreams: WlMedia[] = [];

    this.peerStreams.forEach(stream => {
      if (stream.source === WlMediaSource.cameramic && stream.videoConsumer) {
        stream.size = 6;
        tmpStreams.push(stream);
      }
    });

    if (!tmpStreams.length ) {
      return;
    }

    if (tmpStreams.length === 1) {
      tmpStreams[0].size = 12;
      this.cameraStreams.push(tmpStreams);
    } else {
      for (let i = 0 ; i < tmpStreams.length ; i++ ) {
        if ( i % 2 === 0 ) {
          this.cameraStreams.push([tmpStreams[i]]);
        } else {
          this.cameraStreams[this.cameraStreams.length - 1].push(tmpStreams[i]);
        }
      }
    }

    this.logger.debug(this.cameraStreams);
  }

  public cameraToggleSide(toggle: boolean) {
    this.cameraStreams.forEach(arr => {
      arr.forEach(element => {
        element.toggleSide = toggle;
      });
    });
    this.toggleSide = toggle;
  }

  private setupVolumeDetect(stream: WlMedia ) {
    const speechEvents = hark(stream, {});
    speechEvents.on('speaking', () => {
      this.logger.debug('%s speaking.', stream.peer.id);
      stream.volume = 10;
    });
    speechEvents.on('stopped_speaking', () => {
      this.logger.debug('%s stopped_speaking.', stream.peer.id);
      stream.volume = 0;
    });
    speechEvents.on('volume_change', (volume, threshold) => {
      const calVolume = volume + 100;
      if ( calVolume > 50 ) {
        stream.volume = Math.floor(( calVolume - 50 ) * 2);
      }
    });
  }

  private consumerClosed(data) {
    const {consumerId} = data;

    this.logger.debug('consumerClosed, %s', consumerId);

    const foundStream = this.peerStreams.find(ps => {
      return ( ps.videoConsumer && ps.videoConsumer.id === consumerId ) ||
      ( ps.audioConsumer && ps.audioConsumer.id === consumerId);
    });

    if ( !foundStream ) {
      this.logger.debug('consumerClosed, do not find consumer: %s', consumerId);
      return;
    }

    const peer = foundStream.peer;

    if ( foundStream.videoConsumer && foundStream.videoConsumer.id === consumerId ) {
      foundStream.removeTrack(foundStream.videoConsumer.track);
      foundStream.videoConsumer.close();
      foundStream.videoConsumer = null;
    } else {
      foundStream.removeTrack(foundStream.audioConsumer.track);
      foundStream.audioConsumer.close();
      foundStream.audioConsumer = null;
    }

    if ( !foundStream.videoConsumer && !foundStream.audioConsumer) {
      this.peerStreams = this.peerStreams.filter( ps => ps !== foundStream);

      if (peer.camStream === foundStream ) {
        peer.camStream = null;
      } else if (peer.screenStream === foundStream ) {
        peer.screenStream = null;
      } else if (peer.mediaStream === foundStream) {
        peer.mediaStream = null;
      } else {
        this.logger.error('Do not find stream in peer when stream closed!');
      }
    }

    if (foundStream.source === WlMediaSource.cameramic) {
      this.updateCameraStreams();
    } else if (foundStream.source === WlMediaSource.screen ) {
      this.updateScreenStreams();
    } else if (foundStream.source === WlMediaSource.media) {
      this.updateMediaStreams();
    } else {
      this.logger.error('Wrong media source, Check it !');
    }
  }

  public isEnableCamera(peer: WlPeer) {
    return peer.camStream && peer.camStream.videoConsumer && !peer.camStream.videoConsumer.closed;
  }

  public isEnableMic(peer: WlPeer) {
    return peer.camStream && peer.camStream.audioConsumer && !peer.camStream.audioConsumer.closed;
  }

  private peerClosed(data: any) {
    const { peerId } = data;
    this.peersInfo = this.peersInfo.filter(p =>  p.id !== peerId);
  }

  private newPeer(data: any) {
    const { id } = data;
    if ( this.getPeerInfo(id) ) {
      this.logger.warn('peer %s already existed!', id );
      return;
    }

    const peer = new WlPeer();
    peer.id = data.id;
    peer.roler = +data.roler;
    peer.displayName = data.displayName;
    peer.picture = data.picture;
    peer.platform = data.platform;

    this.logger.debug('newPeer, %o', peer);
    this.peersInfo = [ ...this.peersInfo, peer ];
  }

  async connectMediaServer(reconnect = false) {
    if ( reconnect ) {
      if (this.media.recvTransport && await this.checkTransport(this.media.recvTransport.id)) {
        this.logger.debug('recv transport closed in server, %s', this.media.recvTransport.id);
        this.media.recvTransport.close();
      }
      if (this.media.sendTransport && await this.checkTransport(this.media.sendTransport.id)) {
        this.logger.debug('send transport closed in server, %s', this.media.sendTransport.id);
        this.media.sendTransport.close();
      }
    }

    if ( !this.media.device.loaded ) {
      const routerRtpCapabilities = await this.signaling.getRouterRtpCapabilities();
      this.logger.debug('get route capabilities from server: ', routerRtpCapabilities);

      const loaded = await this.media.load({routerRtpCapabilities});
      if (!loaded) {
        this.logger.error('device load error!');
        return false;
      }
    }

    try {
      await this._createSendTransport();
      await this._createRecvTransport();
      await this.joinRoom();
    } catch (e) {
      this.logger.error(e);
      return false;
    }

    return true;
  }

  private async checkTransport(transportId) {
    const { closed } = await this.signaling.sendRequest(
      RequestMethod.getTransportStats,
      {transportId}
    ) as any;

    return closed;
  }

  async joinRoom() {
    const { joined, peers } = await this.signaling.join({
      roler: this.profile.me.roler,
      displayName : this.profile.me.displayName,
      picture: this.profile.me.picture,
      platform: this.profile.me.platform,
      rtpCapabilities: this.media.device.rtpCapabilities
    });

    if ( joined ) {
      return;
    }

    this.logger.debug('joined, peersinfo: %s', JSON.stringify(peers));

    for ( const peer of peers) {
      this.newPeer(peer);
    }
  }

   async init() {
    this.peersInfo = [ ...this.peersInfo, this.profile.me];

    if ( !this.profile.mainAudioDeviceId || !this.profile.mainAudioDeviceId) {
      await this.media.enumerateDevies();
      if (typeof this.media.videoDevices[0] !== 'undefined')
          this.profile.mainVideoDeviceId = this.media.videoDevices[0].deviceId;
      if (typeof this.media.audioDevices[0] !== 'undefined')
          this.profile.mainAudioDeviceId = this.media.audioDevices[0].deviceId;
    }

    this.hasInit = true;
   }

   getPeerInfo(peerId: string) {
    return this.peersInfo.find(peer => peer.id === peerId);
   }

  async _createSendTransport() {
    if ( this.media.sendTransport
      && !this.media.sendTransport.closed
      && this.media.sendTransport.connectionState !== 'closed'
      && this.media.sendTransport.connectionState !== 'failed') {
        this.logger.debug('sendTransport status : %s, connectionState: %s',
          this.media.sendTransport.closed,
          this.media.sendTransport.connectionState);
        return;
      }

    const transportInfo = await this.signaling.createWebRtcTransport({
      forceTcp: this.profile.forceTcp,
      producing: true,
      consuming: false
    });
    this.logger.debug('producer transportInfo: %o', transportInfo);

    const transport = this.media.createSendTransport(transportInfo);
    transport.on('connect', async ({dtlsParameters}, callback, errback) => {
      this.logger.debug('transport connect event, dtlsParameter: %o', dtlsParameters);

      await this.signaling.sendRequest(
        RequestMethod.connectWebRtcTransport,
        {
          transportId : transport.id,
          dtlsParameters
        })
        .then(callback)
        .catch(errback);
    });
    transport.on('produce', async ({ kind, rtpParameters, appData }, callback, errback) => {
        this.logger.debug('transport produce event, kind: %s, rtpParameters: %o', kind, rtpParameters);

        await this.signaling.sendRequest(
          RequestMethod.produce,
          {
            transportId : transport.id,
            kind,
            rtpParameters,
            appData
          })
          .then(callback)
          .catch(errback);
      });

    this.media.setSendTransport(transport);
  }

  async produceLocalCamera() {
    if ( !this.localCam ) {
      try {
        await this.getLocalCamera();
      } catch (e) {
        return;
      }
    }
    const producer = await this.produceVideo(this.localCam, WlMediaSource.cameramic);
    this.stats.setVideoProducer(producer);
  }

  async produceLocalMic() {
    if ( !this.localMic) {
      try {
        await this.getLocalMic();
      } catch (e) {
        return;
      }
    }
    const producer = await this.produceAudio(this.localMic, WlMediaSource.cameramic);
    this.stats.setAudioProducer(producer);
  }

  async stopLocalCamera() {
    const sourceVideo = this.profile.me.id + '_' + WlMediaSource.cameramic + '_' + 'video';

    const videoProducer = this.producerMap.get(sourceVideo);

    if ( videoProducer ) {
      videoProducer.close();
      await this.signaling.sendRequest(
        RequestMethod.closeProducer, {producerId: videoProducer.id}
      );

      this.logger.debug('stopLocalCamera, video: %s', videoProducer.id);
      this.producerMap.delete(sourceVideo);
    }

    if (this.localCam ) {
      this.localCam.getVideoTracks().forEach(track => track.stop());
      this.localCam = null;
    }
  }

  async stopLocalMic() {
    const sourceAudio = this.profile.me.id + '_' + WlMediaSource.cameramic + '_' + 'audio';

    const audioProducer = this.producerMap.get(sourceAudio);

    if ( audioProducer ) {
      audioProducer.close();
      await this.signaling.sendRequest(
        RequestMethod.closeProducer, {producerId: audioProducer.id}
      );

      this.logger.debug('stopLocalCamera, audio: %s', audioProducer.id);

      this.producerMap.delete(sourceAudio);
    }

    if (this.localMic) {
      this.localMic.getAudioTracks().forEach(track => track.stop());
      this.localMic = null;
    }
  }

  async  produceAudio(stream: MediaStream, src: string) {
    this.logger.debug('produce now kind: audio, id: %s.', stream.id);

    if ( ! this.media.device.canProduce('audio')) {
      this.logger.error('this device can not produce audio!');
      return;
    }

    const track = stream.getAudioTracks()[0];
    if ( ! track ) {
      this.logger.error('Do not find audio track!');
      return null;
    }

    const source =  this.profile.me.id + '_' + src + '_' + 'audio';

    const producer = await this.media.sendTransport.produce({
      track,
      appData: { source }
    });

    producer.on('transportclose', () => {
      this.logger.warn('video source %s transportclose !', source);
      this.producerMap.delete(source);
    });

    producer.on('trackended', () => {
      this.logger.debug('audio source %s trackended!', source);
      this.signaling.sendRequest(
        RequestMethod.closeProducer,
        {producerId: producer.id}
      );

      this.producerMap.delete(source);
    });

    this.producerMap.set(source, producer);
    return producer;
  }

  async  produceVideo(stream: MediaStream, src: string) {
    this.logger.debug('produce now, kind: video, id: %s.', stream.id);

    if ( ! this.media.device.canProduce('video')) {
      this.logger.error('this device can not produce video!');
      return;
    }

    const tracks = stream.getVideoTracks();
    this.logger.debug('stream tracks: %o.', tracks);
    const track = tracks[0];
    if ( ! track ) {
      this.logger.error('Do not find video track!');
      return;
    }

    const source =  this.profile.me.id + '_' + src + '_' + 'video';

    const params: mediaTypes.ProducerOptions = {
      track,
      appData: {
        source
      },
      codec: this.media.device.rtpCapabilities.codecs.find(codec => codec.mimeType === 'video/H264')
    };

    const producer = await this.media.sendTransport.produce(params);

    producer.on('transportclose', () => {
      this.logger.warn('video source %s transportclose !', source);
      this.producerMap.delete(source);
    });

    producer.on('trackended', () => {
      this.logger.debug('video source %s trackended!', source);
      this.signaling.sendRequest(
        RequestMethod.closeProducer,
        {producerId: producer.id}
      );

      this.producerMap.delete(source);
    });

    this.producerMap.set(source, producer);
    return producer;
  }

  getProducer(producerId: string): mediaTypes.Producer {
    let producer;
    this.producerMap.forEach((value, key) => {
      if (value.id === producerId ) {
        producer = value;
      }
    });

    return producer;
  }
  async startScreenShare() {
    const screen = new DisplayMediaScreenShare();
    try {
      await screen.start(SCREENSHARE_CONSTRAINTS);
    } catch (e) {
      this.logger.error(e);
      return false;
    }

    this.pScreen = screen;

    const producer = await this.produceVideo(this.pScreen.pStream, 'screen');
    producer.on('trackended', () => {
      this.pScreen = null;
    });

    return true;
  }

  stopScreenShare() {
    if ( this.pScreen ) {
      this.pScreen.stop();
      this.pScreen = null;
    }
  }

  stopProduceStream(stream: WlMedia) {
    stream.getTracks().forEach((track) => {
      track.stop();
      stream.removeTrack(track);
      track.dispatchEvent(new Event('ended'));
    });
  }

  async _createRecvTransport() {
    if ( this.media.recvTransport
      && !this.media.recvTransport.closed
      && this.media.recvTransport.connectionState !== 'closed'
      && this.media.recvTransport.connectionState !== 'failed') {
        this.logger.debug('recvTransport status : %s, connectionState: %s',
          this.media.recvTransport.closed,
          this.media.recvTransport.connectionState);

        return;
      }

    const transportInfo = await this.signaling.createWebRtcTransport({
      forceTcp: this.profile.forceTcp,
      producing: false,
      consuming: true
    });
    this.logger.debug('recv transportInfo: %o', transportInfo);

    const transport = this.media.createRecvTransport(transportInfo);
    this.logger.debug('recv transport id %s, close: %o, direction: %s, connectState: %s',
      transport.id, transport.closed, transport.direction, transport.connectionState
    );

    transport.on('connect', ({ dtlsParameters }, callback, errback) => {
      this.logger.debug('recv transport connect event, dtlsParameters: %o', dtlsParameters);
      this.signaling.connectWebRtcTransport(
        {
          transportId : transport.id,
          dtlsParameters
        })
        .then(callback)
        .catch(errback);
    });

    this.media.setRecvTransport(transport);
  }

  async getLocalCamera() {
    let stream = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: this.profile.mainVideoDeviceId,
              width: VIDEORESOLUTION[this.profile.mainVideoResolution].width,
              height: VIDEORESOLUTION[this.profile.mainVideoResolution].height,
              ...videoConstrain
            },
        }) as WlMedia;
    } catch (e) {
      this.logger.error(e);
      throw new Error('Open Camera Error!');
    }

    this.localCam = stream;
    this.localCam.peer = this.profile.me;
    return this.localCam;
  }

  async getLocalMic() {
    let stream = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId: this.profile.mainAudioDeviceId,
            ...audioConstrain
          }
        }) as WlMedia;
    } catch (e) {
      this.logger.error(e);
      throw new Error('Open Mic Error!');
    }

    this.localMic = stream;
    this.localMic.peer = this.profile.me;
    return this.localMic;
  }

  async roomUpdate() {
      const roomInfo = await this.signaling.getClassroomInfo() as WlClassroom;

      this.eventbus.class$.next({
        type: EventType.class_roomUpdate,
        data: roomInfo
      });
  }

  async setAsPresenter() {
    await this.signaling.sendChangeRoler(ROLE.MASTER);
    this.profile.setRoler(ROLE.MASTER);
  }
}
