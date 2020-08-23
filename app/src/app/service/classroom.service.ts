import { Injectable } from '@angular/core';
import { EventbusService, IEventType, EventType } from './eventbus.service';
import { ProfileService } from './profile.service';
import { LoggerService } from './logger.service';
import { CONNECT_VIDEO_STATUS } from '../defines';
import { PeerService } from './peer.service';
import { WebsocketService } from './websocket.service';

@Injectable({
  providedIn: 'root'
})
export class ClassroomService {
  timeElapsed: string;
  timeElapsedInterval;
  connectTimeInterval;

  constructor(
    private eventbus: EventbusService,
    private profile: ProfileService,
    private logger: LoggerService,
    private peer: PeerService,
    private socket: WebsocketService,
  ) {
    this.eventbus.class$.subscribe((event: IEventType) => {
      if ( event.type === EventType.class_start ) {
        this.profile.started = true;
        this.profile.startTime = Date.now();
      }

      if ( event.type === EventType.class_stop ) {
        this.profile.started = false;
        this.profile.stopTime = Date.now();
      }

      if ( event.type === EventType.class_connectApproval) {
        const { peerId, toPeer, approval } = event.data;
        if ( toPeer === this.profile.me.id ) {
          clearInterval(this.connectTimeInterval);

          if ( approval ) {
            this.startConnectVideo();
          } else {
            this.profile.me.connectVideoStatus = CONNECT_VIDEO_STATUS.Null; // stopped
          }
        }
      }

      if ( event.type === EventType.class_disconnectVideo ) {
        const { toPeer } = event.data;
        this.logger.debug('recv disconnectVideo, toPeer: %s, profile.peerId: %s',
          toPeer, this.profile.me.id);

        if ( toPeer === this.profile.me.id ) {
          this.stopConnectVideo();
        }
      }
    });

    this.checkClassInterval();
  }

  async startConnectVideo() {
    const result = await this.peer.connectMediaServer();
    if ( !result ) {
      return;
    }

    await this.peer.getLocalCamera();
    await this.peer.produceLocalCamera();
    this.profile.me.connectVideoStatus = CONNECT_VIDEO_STATUS.Connected;
  }

  async stopConnectVideo() {
    await this.peer.stopLocalCamera();
    this.profile.me.connectVideoStatus = CONNECT_VIDEO_STATUS.Null;
  }

  checkClassInterval() {
    this.timeElapsedInterval = setInterval(() => {
      if ( !this.profile.started ) {
        return;
      }

      this.profile.startTimeElapsed = (Date.now() - this.profile.startTime) / 1000;

      const mins = Math.floor(this.profile.startTimeElapsed / 60);
      const seconds = Math.floor(this.profile.startTimeElapsed - mins * 60);

      const minsString = mins < 10 ? '0' + mins : mins;
      const secondString = seconds < 10 ? '0' + seconds : seconds;

      this.timeElapsed = `${minsString} : ${secondString}`;
    }, 1000);
  }

  async startClass() {
    if ( this.profile.started ) {
      this.logger.error('Class has been started! Please Stop it first!');
      return;
    }

    const result = await this.peer.connectMediaServer();
    if ( !result ) {
      return;
    }

    this.profile.started = true;
    this.profile.startTime = Date.now();
    this.profile.startTimeElapsed = 0;

    this.logger.debug('class start at: %s', this.profile.startTime);

    await this.socket.sendClassStart();
    await this.peer.produceLocalCamera();
    this.profile.me.connectVideoStatus = CONNECT_VIDEO_STATUS.Connected;
    this.profile.bClassStarter = true;
  }

  async stopClass() {
    this.profile.stopTime = Date.now();
    this.logger.debug('class stop at: %s', this.profile.stopTime);

    this.profile.started = false;
    this.timeElapsed = '';

    await this.peer.stopLocalCamera();
    await this.socket.sendClassStop();

    this.profile.me.connectVideoStatus = CONNECT_VIDEO_STATUS.Null;
    this.profile.bClassStarter = false;
  }

}
