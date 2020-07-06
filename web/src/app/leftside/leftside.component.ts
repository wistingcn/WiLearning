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
import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../service/profile.service';
import { PeerService } from '../service/peer.service';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { EventbusService, EventType, IEventType } from '../service/eventbus.service';
import { ShareVideoComponent } from '../container/share-video/share-video.component';
import { I18nService } from '../service/i18n.service';
import { LoggerService } from '../service/logger.service';
import { WebsocketService } from '../service/websocket.service';
import { RequestConnectVideoTimeout } from '../config';
import { SettingComponent } from '../container/setting/setting.component';
import { CONNECT_VIDEO_STATUS } from '../defines';
import { MediaService } from '../service/media.service';

declare const MediaRecorder: any;

@Component({
  selector: 'app-leftside',
  templateUrl: './leftside.component.html',
  styleUrls: ['./leftside.component.css']
})
export class LeftsideComponent implements OnInit {
  mediaFile: File;
  timeElapsed: string;
  timeElapsedInterval;
  connectTimeInterval;
  shareScreenValid = true;
  shareMediaValid = true;
  requestConnectTimeout;
  bFullscreen = false;
  recordedChunks = [];
  mediaRecorder;
  recorderStart = false;
  recorderIntervalHandler;
  recordingIconSize = false;
  recorderEnable = false;

  constructor(
    public profile: ProfileService,
    public peer: PeerService,
    private overlay: Overlay,
    private eventbus: EventbusService,
    public i18n: I18nService,
    private logger: LoggerService,
    private socket: WebsocketService,
    private media: MediaService,
  ) {
    const win = window as any;
    if (win.MediaRecorder !== undefined) {
      this.recorderEnable = true;
    }

    window.onunload = async (e) => {
      await socket.sendClosePeer(this.profile.bClassStarter);
    };
  }

  ngOnInit() {
    this.checkClassInterval();

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

    document.addEventListener('fullscreenchange', (event) => {
      if ( document.fullscreenElement) {
        this.bFullscreen = true;
      } else {
        this.bFullscreen = false;
      }
    });

    const docu = document as any;
    docu.addEventListener('webkitfullscreenchange', () => {
      docu.webkitIsFullScreen ? this.bFullscreen = true : this.bFullscreen = false;
      }, false);
  }

  shareMedia() {
    const globalPosition = this.overlay.position().global();
    globalPosition
      .top('100px')
      .left('200px');

    const overlayRef = this.overlay.create({
      positionStrategy: globalPosition,
      hasBackdrop: true,
      height: '50vh',
    });
    const portal = new ComponentPortal(ShareVideoComponent);
    overlayRef.attach(portal);

    this.eventbus.overlay$.subscribe((event: any) => {
      if ( event.type === EventType.overlay_shareMediaClosed) {
        overlayRef.detach();
      }
    });

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

  async requestConnectVideo() {
    await this.socket.sendConnectVideoRequest();
    this.profile.me.connectVideoStatus = CONNECT_VIDEO_STATUS.Requested;

    this.requestConnectTimeout = RequestConnectVideoTimeout;
    this.connectTimeInterval = setInterval(() => {
      this.requestConnectTimeout--;

      if ( this.requestConnectTimeout <= 0 ) {
        clearInterval(this.connectTimeInterval);
        this.profile.me.connectVideoStatus = CONNECT_VIDEO_STATUS.Null;
      }
    }, 1000);

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

  enterFullscreen() {
    const fullElement = document.getElementById('fullscreen') as any;
    if ( fullElement.requestFullscreen ) {
      fullElement.requestFullscreen()
      .then(() => {
        this.logger.debug('enter fullscreen mode');
      })
      .catch(() => {
        this.logger.error('enter fullscreen error');
      });
    } else if ( fullElement.webkitRequestFullScreen ) {
      fullElement.webkitRequestFullScreen();
    }
  }

  exitFullscreen() {
    if ( this.bFullscreen ) {
      if ( document.exitFullscreen ) {
        document.exitFullscreen().then(() => {
          this.logger.debug('exit fullscreen mode');
        });
      } else {
        // for safari
        const docu = document as any;
        docu.webkitCancelFullScreen();
      }
    }
  }

  openSettingDialog() {
    const globalPosition = this.overlay.position().global();
    globalPosition
      .top('100px')
      .left('30vw');

    const overlayRef = this.overlay.create({
      positionStrategy: globalPosition,
      hasBackdrop: true,
      height: '60vh',
      width: '40vw',
    });
    const portal = new ComponentPortal(SettingComponent);
    overlayRef.attach(portal);

    this.eventbus.overlay$.subscribe((event: IEventType) => {
      if ( event.type === EventType.overlay_settingClosed) {
        overlayRef.detach();
      }
    });
  }

  toggleVideoNav() {
    this.profile.videoNav = !this.profile.videoNav;
  }

  startRecordMedia() {
    this.media.checkRecorderType();

    const options = {mimeType: 'video/webm; codecs=h264'};
    this.mediaRecorder = new MediaRecorder(this.peer.localStream, options);
    this.logger.debug('mediaRecorder: %o', this.mediaRecorder);

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0 ) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.onerror = (event) => {
      this.logger.error(event.type, event.error.message);
    };

    this.mediaRecorder.onstart = () => {
      this.logger.debug('mediaRecorder start...');
      this.recorderStart = true;
      this.recordedChunks = [];

      this.recorderIntervalHandler = setInterval(() => {
        this.mediaRecorder.requestData();
        this.recordingIconSize = !this.recordingIconSize;
      }, 1000);
    };

    this.mediaRecorder.onstop = () => {
      this.logger.debug('mediaRecorder stop ...');
      this.recorderStart = false;
      clearInterval(this.recorderIntervalHandler);

      const blob = new Blob(this.recordedChunks, {
        type: 'video/webm'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.setAttribute('dislpay', 'none');
      a.href = url;
      a.download = this.profile.me.displayName + '-local' + Date.now() + '.webm';
      a.click();
      URL.revokeObjectURL(url);
    };

    this.mediaRecorder.start();
  }


  stopRecordMedia() {
    this.mediaRecorder.stop();
  }
}
