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
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { EventbusService, EventType } from 'src/app/service/eventbus.service';
import { ProfileService } from 'src/app/service/profile.service';
import { LoggerService } from 'src/app/service/logger.service';
import { VIDEORESOLUTION, getImageMeta } from '../../defines';
import * as hark from 'hark';
import { I18nService } from 'src/app/service/i18n.service';
import { MediaService } from 'src/app/service/media.service';
import { WebsocketService } from 'src/app/service/websocket.service';
import { RoomLogoHeight } from '../../config';
import { PeerService } from 'src/app/service/peer.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {videoConstrain, audioConstrain} from '../../config';


@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css']
})
export class SettingComponent implements OnInit, AfterViewInit {
  videoDisplayStream: MediaStream;
  audioDisplayStream: MediaStream;
  selectedVideoDevice = this.profile.mainVideoDeviceId;
  selectedAudioDevice = this.profile.mainAudioDeviceId;
  selectedVideoResolution = this.profile.mainVideoResolution;
  currentVolume = 0;
  volumeArray = new Array<number>(20);
  logoUrl = this.profile.room.logoUrl;
  announcementText = this.profile.room.announcementText;
  videoFilter = this.profile.room.videoFilter;

  constructor(
    public profile: ProfileService,
    public i18n: I18nService,
    public media: MediaService,
    private eventbus: EventbusService,
    private logger: LoggerService,
    private snackBar: MatSnackBar,
    private socket: WebsocketService,
    private peer: PeerService,
  ) {
  }

  ngOnInit() {
    this.selectVideo();
    this.selectAudio();
  }

  ngAfterViewInit() {
    this.setLogoUrl();
  }

  closeDialog() {
    this.eventbus.overlay$.next({
      type: EventType.overlay_settingClosed
    });
  }

  async selectVideo() {
    this.logger.debug('selected video id : %s, resolution :%s',
      this.selectedVideoDevice, this.selectedVideoResolution);
    this.logger.debug('request video: %s * %s',
      VIDEORESOLUTION[this.selectedVideoResolution].width,
      VIDEORESOLUTION[this.selectedVideoResolution].height,
      );

    navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: this.selectedVideoDevice,
          width: VIDEORESOLUTION[this.selectedVideoResolution].width,
          height: VIDEORESOLUTION[this.selectedVideoResolution].height,
        },
        audio: false
    })
    .then(stream => {
      this.videoDisplayStream = stream;
    }).catch(reason => {
      this.videoDisplayStream = null;
      this.logger.error('Do not support the resolution: %s', reason.name + ':' + reason.message);
      this.snackBar.open('open video error: ' + reason.name, 'close', {
        duration: 5000
      });
    });
  }

  async selectAudio() {
    this.logger.debug('selected audio id : %s', this.selectedAudioDevice);
    this.audioDisplayStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: this.selectedAudioDevice,
          ...audioConstrain
        },
        video: false
      }
    );

    const speechEvents = hark(this.audioDisplayStream, {});
    speechEvents.on('volume_change', (volume, threshold) => {
      this.currentVolume = volume + 100;
    });
  }

  setLogoUrl() {
    if ( ! (this.logoUrl && this.logoUrl.length) ) {
      return;
    }

    this.logger.debug('logo url : %s', this.logoUrl);
    const image = document.getElementById('setting-logo-img') as HTMLImageElement;
    image.src = this.logoUrl;
    image.onload = () => {
      this.logger.debug('log image width: %s, height: %s', image.width, image.height);
      image.height = RoomLogoHeight;
    };
    image.onerror = () => {
      this.logger.error('load logo image error!');
      this.snackBar.open('load logo image error! ' + this.logoUrl, 'close', {
        duration: 5000
      });
    };
  }

  async saveSetting() {
    if ( this.profile.mainVideoDeviceId !== this.selectedVideoDevice ||
        this.profile.mainVideoResolution !== this.selectedVideoResolution
      ) {
      this.profile.mainVideoDeviceId = this.selectedVideoDevice;
      this.profile.mainVideoResolution = this.selectedVideoResolution;
      localStorage.setItem('WiLearning.device.mainvideo.id', this.selectedVideoDevice);
      localStorage.setItem('WiLearning.device.mainvideoresolution.index', this.selectedVideoResolution.toString());

      if ( this.profile.privilege.pubCamera ) {
        await this.peer.getLocalCamera();
      }
    }

    if ( this.profile.mainAudioDeviceId !== this.selectedAudioDevice ) {
      this.profile.mainAudioDeviceId = this.selectedAudioDevice;
      localStorage.setItem('WiLearning.device.mainaudio.id', this.selectedAudioDevice);

      if ( this.profile.privilege.pubCamera ) {
        await this.peer.getLocalCamera();
      }
    }

    if ( this.profile.room.logoUrl !== this.logoUrl ) {
      this.profile.room.logoUrl = this.logoUrl;
      this.socket.sendChangeLogo();
    }

    if ( this.profile.room.announcementText !== this.announcementText ) {
      this.profile.room.announcementText = this.announcementText;

      this.socket.sendAnnouncementText();
    }

    if ( this.profile.room.videoFilter !== this.videoFilter ) {
      this.profile.room.videoFilter = this.videoFilter;
      this.socket.sendVideoFilter();
    }
  }
}
