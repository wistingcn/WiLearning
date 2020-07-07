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
import * as socketIO from 'socket.io-client';
import { MediaServer, RequestTimeout } from '../config';
import { ProfileService } from './profile.service';
import { LoggerService } from './logger.service';
import { EventbusService, IEventType, EventType } from './eventbus.service';
import { RequestMethod, ClaRoom } from '../defines';
import { types as mediaTypes } from 'mediasoup-client';
import { MediaService } from './media.service';
import { MatSnackBar } from '@angular/material/snack-bar';

const pRequestMap = new Map<string, string>();
const pNotificationMap = new Map<string, string>();

const Request = (ref: string = null) => {
  return ( target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    if ( ref ) {
      pRequestMap.set(ref, propertyKey);
    } else {
      pRequestMap.set(propertyKey, propertyKey);
    }
  };
};

const Notification = (ref: string = null) => {
  return ( target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    if ( ref ) {
      pNotificationMap.set(ref, propertyKey);
    } else {
      pNotificationMap.set(propertyKey, propertyKey);
    }
  };
};

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: SocketIOClient.Socket;

  constructor(
    private profile: ProfileService,
    private logger: LoggerService,
    private eventbus: EventbusService,
    private snackBar: MatSnackBar,
  ) {
  }

  connect() {
    const socketUrl =
      `${MediaServer.address}/?roomId=${this.profile.roomId}&peerId=${this.profile.me.id}`;

    this.logger.debug('socketUrl : %s', socketUrl);

    this.socket = socketIO(socketUrl, {
      timeout: 3000,
      reconnection:	true,
      reconnectionAttempts: Infinity,
      reconnectionDelayMax: 2000,
      transports: ['websocket'],
    });

    this.setupEventHandler(this.socket);
    this.setupNotificationHandler();
    this.setupRequestHandler();
  }

  private setupEventHandler(socket: SocketIOClient.Socket) {
    socket.on('connect', () => {
      this.logger.debug('socket connected !');

      this.eventbus.socket$.next({
        type: EventType.socket_connected
      });
    });

    socket.on('connect_error', () => {
      this.logger.warn('reconnect_failed !');
      this.snackBar.open('socket connect error!', 'close', {duration: 5000});
    });

    socket.on('connect_timeout', () => {
      this.snackBar.open('socket connect timeout!', 'close', {duration: 5000});
    });

    socket.on('disconnect', (reason) => {
      this.logger.error('Socket disconnect, reason: %s', reason);
      this.snackBar.open('Socket disconnect!, reason: ' + reason , 'close', {duration: 5000});

      this.eventbus.socket$.next({
        type: EventType.socket_disconnected
      });
    });

    socket.on('reconnect', attemptNumber => {
      this.logger.debug('"reconnect" event [attempts:"%s"]', attemptNumber);
    });

    socket.on('reconnect_failed', () => {
      this.logger.warn('reconnect_failed !');
    });
  }

  private setupRequestHandler() {
    const socket = this.socket;
    socket.on('request', (request, cb) => {
      this.logger.debug(
        'request event, method: %s,data: %o', request.method, request.data
      );

      const regiMethod = pRequestMap.get(request.method);
      if (!regiMethod) {
        this.logger.warn('request method: %s, do not register!', request.method);
        return;
      }

      this[regiMethod](request.data, cb);
    });

  }

  private setupNotificationHandler() {
    const socket = this.socket;
    socket.on('notification', async (notification) => {
      // do not want log activeSpeaker, too noise
      if ( notification.method !== 'activeSpeaker') {
        this.logger.debug(
          'notification event, method: %s,data: %o', notification.method, notification.data
        );
      }

      const regiMethod = pNotificationMap.get(notification.method);
      if (!regiMethod) {
        this.logger.debug('notification method: %s, do not register!', notification.method);
        return;
      }
      this[regiMethod](notification.data);
    });
  }

  @Notification()
  private syncDocInfo(data) {
    // const { peerId, info } = data;
    this.eventbus.docoment$.next({
      type: EventType.document_syncDocInfo,
      data
    });
  }

  @Notification()
  private activeSpeaker(data: any) {
  }

  @Notification()
  private consumerScore(data: any) {
    const { consumerId, score } = data;
    this.eventbus.media$.next({
      type: EventType.media_consumerScore,
      data
    });
  }

  // data: {id, displayName, picture}
  @Notification()
  private newPeer(data: any) {
    this.eventbus.media$.next({
      type: EventType.media_newPeer,
      data
    });
  }

  // data: { peerId: ... }
  @Notification()
  private peerClosed(data) {
    this.eventbus.media$.next({
      type: EventType.media_peerClose,
      data
    });
  }

  @Notification()
  private consumerClosed(data) {
    this.eventbus.media$.next({
      type: EventType.media_consumerClosed,
      data
    });
  }

  @Notification()
  private consumerPaused(data) {
    this.eventbus.media$.next({
      type: EventType.media_consumerPaused,
      data
    });
  }
  @Notification()
  private consumerResumed(data) {
    this.eventbus.media$.next({
      type: EventType.media_consumerResumed,
      data
    });
  }

  // data: { peerId, chatMessage }
  @Notification()
  private chatMessage(data: any) {
    this.eventbus.chat$.next({
      type: EventType.chat_message,
      data
    });
  }

  @Notification()
  private async classStart(data) {
    this.profile.room = await this.getRoomInfo() as ClaRoom;
    this.eventbus.class$.next({
      type: EventType.class_start
    });
  }

  @Notification()
  private classStop(data) {
    this.eventbus.class$.next({
      type: EventType.class_stop
    });
  }

  @Notification()
  private connectVideo(data) {
    this.eventbus.class$.next({
      type: EventType.class_connectVideo,
      data
    });
  }

  @Notification()
  private connectApproval(data) {
    this.eventbus.class$.next({
      type: EventType.class_connectApproval,
      data
    });
  }

  @Notification()
  private announcementText(data) {
    this.profile.room.announcementText = data.text;
  }

  @Notification()
  private videoFilter(data) {
    this.profile.room.videoFilter = data.filter;
  }

  @Notification()
  private changeLogo(data) {
    this.profile.room.logoUrl = data.url;
  }

  @Notification()
  private disconnectVideo(data) {
    this.eventbus.class$.next({
      type: EventType.class_disconnectVideo,
      data
    });
  }

  @Request()
  private newConsumer(data: any, cb: any) {
    this.eventbus.media$.next({
      type: EventType.media_newConsumer,
      data
    });
    cb();
  }

  sendRequest(method, data = null) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject('No socket connection.');
      } else {
        this.socket.emit('request', { method, data },
          this.timeoutCallback((err, response) => {
            if (err) {
              this.logger.error('sendRequest %s timeout! socket: %o', method, this.socket);
              this.snackBar.open('Websocket sendRequest timeout: ' + method,
                'close', {duration: 5000});
              reject(err);
            } else {
              resolve(response);
            }
          })
        );
      }
    });
  }

  timeoutCallback(callback) {
    let called = false;

    const interval = setTimeout(() => {
      if (called) {
        return;
      }
      called = true;
      callback(new Error('Request timeout.'));
    }, RequestTimeout);

    return (...args) => {
      if (called) {
        return;
      }
      called = true;
      clearTimeout(interval);

      callback(...args);
    };
  }

  async getRouterRtpCapabilities() {
    const callRes = await this.sendRequest(
      RequestMethod.getRouterRtpCapabilities,
    );

    return callRes as mediaTypes.RtpCapabilities;
  }

  async createWebRtcTransport(params: any) {
    const callRes = await this.sendRequest(
      RequestMethod.createWebRtcTransport,
      params
    );

    return callRes as mediaTypes.TransportOptions;
  }

  async join(params: any) {
    const callRes = await this.sendRequest(
      RequestMethod.join,
      params
    );

    return callRes as { peers: any, joined: boolean};
  }

  async connectWebRtcTransport(params: any) {
    const callRes = await this.sendRequest(
      RequestMethod.connectWebRtcTransport,
      params
    );

    return callRes as any;
  }

  sendSyncDocInfo(info) {
    return this.sendRequest(
     RequestMethod.syncDocInfo,
     {info}
    );
  }

  sendClassStart() {
    return this.sendRequest(
      RequestMethod.classStart,
      {
        roomId : this.profile.roomId,
      }
    );
  }

  sendClassStop() {
    return this.sendRequest(
      RequestMethod.classStop,
      {
        roomId : this.profile.roomId,
      }
    );
  }

  sendChangeLogo() {
    return this.sendRequest(
      RequestMethod.changeLogo,
      {
        url: this.profile.room.logoUrl,
      }
    );
  }

  sendAnnouncementText() {
    return this.sendRequest(
      RequestMethod.announcementText,
      {
        text: this.profile.room.announcementText,
      }
    );
  }

  sendVideoFilter() {
    return this.sendRequest(
      RequestMethod.videoFilter,
      {
        filter: this.profile.room.videoFilter,
      }
    );
  }

  sendIceRestart(transportId: string) {
    return this.sendRequest(
      RequestMethod.restartIce,
      {
        transportId
      }
    );
  }

  getRoomInfo() {
    return this.sendRequest(
      RequestMethod.roomInfo,
      {
        roomId : this.profile.roomId,
      }
    );
  }

  sendConnectVideoRequest() {
    return this.sendRequest(
      RequestMethod.connectVideo,
      {
        roomId : this.profile.roomId,
      }
    );
  }

  sendConnectApproval(toPeer, approval) {
    return this.sendRequest(
      RequestMethod.connectApproval,
      {
        toPeer,
        approval,
      }
    );
  }

  sendDisconnectVideo(toPeer) {
    return this.sendRequest(
      RequestMethod.disconnectVideo,
      {
        toPeer,
      }
    );
  }

  sendClosePeer(stopClass) {
    return this.sendRequest(
      RequestMethod.closePeer,
      {
        stopClass
      }
    );
  }
}
