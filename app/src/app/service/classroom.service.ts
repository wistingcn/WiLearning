import { Injectable } from '@angular/core';
import { EventbusService, IEventType, EventType } from './eventbus.service';
import { ProfileService } from './profile.service';
import { LoggerService } from './logger.service';
import { CONNECT_VIDEO_STATUS } from '../defines';
import { PeerService } from './peer.service';
import { SignalingService } from './signaling.service';
import { WlClassroom, RoomStatus } from '../defines';

@Injectable({
  providedIn: 'root'
})
export class ClassroomService extends WlClassroom {
  timeElapsed: string;
  timeElapsedInterval;
  connectTimeInterval;
  bClassStarter = false;

  constructor(
    private eventbus: EventbusService,
    private profile: ProfileService,
    private logger: LoggerService,
    private peer: PeerService,
    private signaling: SignalingService,
  ) {
    super();

    this.eventbus.class$.subscribe((event: IEventType) => {
      if ( event.type === EventType.class_start ) {
        this.status = RoomStatus.started;
        this.startTime = Date.now();
      }

      if ( event.type === EventType.class_stop ) {
        this.status = RoomStatus.stopped;
        this.stopTime = Date.now();
        this.timeElapsed = '';
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

      if (event.type === EventType.class_muted ) {
        const { to , kind } = event.data;
        if (to === 'all' || to === this.profile.me.id ) {
          if (kind === 'audio' ) {
            this.mutedAudio = true;
          } else {
            this.mutedVideo = true;
          }
        }
      }

      if (event.type === EventType.class_unmuted ) {
        const { to , kind } = event.data;
        if (to === 'all' || to === this.profile.me.id ) {
          if (kind === 'audio' ) {
            this.mutedAudio = false;
          } else {
            this.mutedVideo = false;
          }
        }
      }

      if (event.type === EventType.class_roomUpdate ) {
        const roomInfo = event.data;
        this.logger.debug('classroom info : %s', JSON.stringify(roomInfo));

        this.status = roomInfo.status;
        this.startTime = roomInfo.startTime;
        this.stopTime = roomInfo.stopTime;
        this.mutedAudio = roomInfo.mutedAudio;
        this.mutedVideo = roomInfo.mutedVideo;
      }
    });

    this.checkClassInterval();
  }

  async startConnectVideo() {
    await this.peer.produceLocalCamera();
    await this.peer.produceLocalMic();
    this.profile.me.connectVideoStatus = CONNECT_VIDEO_STATUS.Connected;
  }

  async stopConnectVideo() {
    await this.peer.stopLocalCamera();
    await this.peer.stopLocalMic();
    this.profile.me.connectVideoStatus = CONNECT_VIDEO_STATUS.Null;
  }

  checkClassInterval() {
    this.timeElapsedInterval = setInterval(() => {
      if ( !this.started ) {
        return;
      }

      const startTimeElapsed = (Date.now() - this.startTime) / 1000;

      const mins = Math.floor(startTimeElapsed / 60);
      const seconds = Math.floor(startTimeElapsed - mins * 60);

      const minsString = mins < 10 ? '0' + mins : mins;
      const secondString = seconds < 10 ? '0' + seconds : seconds;

      this.timeElapsed = `${minsString} : ${secondString}`;
    }, 1000);
  }

  async startClass() {
    if ( this.started ) {
      this.logger.error('Class has been started! Please Stop it first!');
      return;
    }

    this.status = RoomStatus.started;
    this.startTime = Date.now();

    this.logger.debug('class start at: %s', this.startTime);

    await this.signaling.sendClassStart();
    this.bClassStarter = true;
  }

  async stopClass() {
    this.stopTime = Date.now();
    this.logger.debug('class stop at: %s', this.stopTime);

    this.status = RoomStatus.stopped;
    this.timeElapsed = '';

    await this.peer.stopLocalCamera();
    await this.peer.stopLocalMic();
    await this.signaling.sendClassStop();

    this.bClassStarter = false;
  }

  async mutedAll() {
    await this.signaling.sendMuted('all', 'video');
    await this.signaling.sendMuted('all', 'audio');
    this.mutedAudio = true;
    this.mutedVideo = true;
  }

  async unmutedAll() {
    await this.signaling.sendUnmuted('all', 'video');
    await this.signaling.sendUnmuted('all', 'audio');
    this.mutedAudio = false;
    this.mutedVideo = false;
  }

  get started() {
    return this.status === RoomStatus.started;
  }
}
