import { Component, OnInit, OnDestroy } from '@angular/core';
import { PeerService } from '../../service/peer.service';
import { LoggerService } from '../../service/logger.service';
import { MediaService } from '../../service/media.service';
import { ProfileService } from '../../service/profile.service';
import { VIDEORESOLUTION } from '../../defines';
import { ToastController } from '@ionic/angular';
import {videoConstrain, audioConstrain} from '../../config';
import * as hark from 'hark';
import { EventbusService, EventType } from '../../service/eventbus.service';
import { trace } from 'console';
import { I18nService } from '../../service/i18n.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss'],
})
export class SettingComponent implements OnInit, OnDestroy {
  localCam: MediaStream;
  localMic: MediaStream;
  volumeArray = new Array<number>(20);
  currentVolume = 0;

  selectedVideoResolution = this.profile.mainVideoResolution;
  selectedAudioDevice = this.profile.mainAudioDeviceId;
  selectedVideoDevice = this.profile.mainVideoDeviceId;

  constructor(
    public peer: PeerService,
    public media: MediaService,
    public profile: ProfileService,
    public i18n: I18nService,
    private logger: LoggerService,
    private toastController: ToastController,
    private eventbus: EventbusService,
  ) {
  }

  async ngOnInit() {
    await this.media.enumerateDevies();
    if (!this.profile.mainAudioDeviceId && typeof this.media.audioDevices[0] !== 'undefined') {
      this.profile.mainAudioDeviceId = this.media.audioDevices[0].deviceId;
      this.selectedAudioDevice = this.profile.mainAudioDeviceId;
    }
    if (!this.profile.mainVideoDeviceId && typeof this.media.videoDevices[0] !== 'undefined') {
      this.profile.mainVideoDeviceId = this.media.videoDevices[0].deviceId;
      this.selectedVideoDevice = this.profile.mainVideoDeviceId;
    }

    this.selectAudio();
    this.selectVideo();
  }

  ngOnDestroy() {
    if (this.localCam) {
      this.localCam.getVideoTracks().forEach(track => track.stop());
    }
    if (this.localMic) {
      this.localMic.getAudioTracks().forEach(track => track.stop());
    }
  }

  selectVideoDevice(ev: CustomEvent) {
    this.selectedVideoDevice = ev.detail.value;
    this.selectVideo();
  }

  selectVideoResolution(ev: CustomEvent) {
    this.selectedVideoResolution = ev.detail.value;
    this.selectVideo();
  }

  selectAudioDevice(ev: CustomEvent) {
    this.selectedAudioDevice = ev.detail.value;
    this.selectAudio();
  }

  async selectVideo() {
    this.logger.debug('selected video id : %s, resolution :%s', this.selectedVideoDevice, this.selectedVideoResolution);
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
    }).then(stream => {
      this.localCam = stream;
    }).catch(reason => {
      this.localCam = null;
      this.logger.error('Do not support the resolution: %s', reason.name + ':' + reason.message);
      this.toastController.create({message: this.i18n.lang.getCameraFailed, duration: 6000});
    });
  }

  async selectAudio() {
    this.logger.debug('selected audio id : %s', this.selectedAudioDevice);
    await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: this.selectedAudioDevice,
          ...audioConstrain
        },
        video: false
      }
    ).then(stream => {
      this.localMic = stream;
      const speechEvents = hark(stream, {});
      speechEvents.on('volume_change', (volume, threshold) => {
        this.currentVolume = volume + 100;
      });
    }).catch(reason => {
      this.localMic = null;
      this.logger.error(reason);
      this.toastController.create({message: this.i18n.lang.getMicFailed, duration: 6000});
    });

  }

  saveSetting() {
    this.profile.mainVideoDeviceId = this.selectedVideoDevice;
    this.profile.mainVideoResolution = this.selectedVideoResolution;
    this.profile.mainAudioDeviceId = this.selectedAudioDevice;
  }

  close() {
    this.eventbus.popover$.next({
      type: EventType.popover_settingClosed
    });
  }
}
