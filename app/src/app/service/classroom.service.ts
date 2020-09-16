import { Injectable } from '@angular/core';
import { EventbusService, IEventType, EventType } from './eventbus.service';
import { ProfileService } from './profile.service';
import { LoggerService } from './logger.service';
import { CONNECT_VIDEO_STATUS } from '../defines';
import { PeerService } from './peer.service';
import { SignalingService } from './signaling.service';

@Injectable({
  providedIn: 'root'
})
export class ClassroomService {
  timeElapsed: string;
  timeElapsedInterval;
  connectTimeInterval;

  public mutedAudio = false;
  public mutedVideo = false;

  constructor(
    private eventbus: EventbusService,
    private profile: ProfileService,
    private logger: LoggerService,
    private peer: PeerService,
    private signaling: SignalingService,
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

    this.profile.started = true;
    this.profile.startTime = Date.now();
    this.profile.startTimeElapsed = 0;

    this.logger.debug('class start at: %s', this.profile.startTime);

    await this.signaling.sendClassStart();
    this.profile.bClassStarter = true;
  }

  async stopClass() {
    this.profile.stopTime = Date.now();
    this.logger.debug('class stop at: %s', this.profile.stopTime);

    this.profile.started = false;
    this.timeElapsed = '';

    await this.peer.stopLocalCamera();
    await this.peer.stopLocalMic();
    await this.signaling.sendClassStop();

    this.profile.me.connectVideoStatus = CONNECT_VIDEO_STATUS.Null;
    this.profile.bClassStarter = false;
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

}
