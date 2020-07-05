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
import { makeRandomString, ClaPeer } from '../defines';
import { LoggerService } from './logger.service';
import {ROLE, ClaRoom, RoomStatus } from '../defines';
import { Platform } from '@angular/cdk/platform';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  public roomId = '1111';
  public forceTcp = false;
  public useSimulcast = false;
  public me = new ClaPeer();
  public videoNav = true;

  public started = false; // Classroom status
  public startTime: number;
  public startTimeElapsed: number;
  public stopTime: number;
  public bClassStarter = false;

  public bLogin = false;

  public room = new ClaRoom();

  public mainVideoDeviceId;
  public mainAudioDeviceId;
  public mainVideoResolution = 0;

  public privilegeAll = [
    // 0
    {},
    // ROLE.SPEAKER = 1
    {
      pubCamera: true,
      classControl: true,
      draw: true,
      shareDesktop: true,
      shareMedia: true,
      raiseHand: false,
      connectVideo: false,
    },
    // ROLE.AUDIENCE = 2
    {
      pubCamera: false,
      classControl: false,
      draw: false,
      shareDesktop: false,
      shareMedia: false,
      raiseHand: true,
      connectVideo: true,
    },
  ];

  constructor(
    private logger: LoggerService,
    private platform: Platform,
  ) {
    this.me.id = this.genPeerId();
    this.logger.debug('peerId: %s', this.me.id);

    this.mainVideoDeviceId = localStorage.getItem('WiMeeting.device.mainvideo.id');
    this.mainAudioDeviceId = localStorage.getItem('WiMeeting.device.mainaudio.id');
    this.mainVideoResolution = +localStorage.getItem('WiMeeting.device.mainvideoresolution.index');

    if ( this.platform.ANDROID) {
      this.me.platform = 'android';
    } else if ( this.platform.IOS ) {
      this.me.platform = 'ios';
    } else if ( this.platform.BLINK ) {
      this.me.platform = 'chrome';
    } else if ( this.platform.WEBKIT) {
      this.me.platform = 'mac';
    } else {
      this.me.platform = 'pc';
    }
  }

  get privilege() {
    return this.privilegeAll[this.me.roler];
  }

  genPeerId() {
    let peerId = sessionStorage.getItem('WiMeeting.peerId');
    if ( !peerId ) {
      peerId = makeRandomString(8);
      sessionStorage.setItem('WiMeeting.peerId', peerId);
    }

    return peerId;
  }

}
