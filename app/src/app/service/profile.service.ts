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
import { makeRandomString, WlPeer, WlColor } from '../defines';
import { LoggerService } from './logger.service';
import { WlBoardComp, WlRoomInfo } from '../defines';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  public roomId = '103426';
  public forceTcp = false;
  public useSimulcast = false;
  public videoNav = true;

  public color = WlColor.medium;

  public bLogin = false;
  public themeDark = false;
  public boardComponent = WlBoardComp.video;

  public roomInfo: WlRoomInfo; // not classroom

  public mainVideoDeviceId = '';
  public mainAudioDeviceId = '';
  public mainVideoResolution = 0;
  public me = new WlPeer();
  public language = 'zh-CN';

  public privilegeAll = [
    {},
    // ROLE.MASTER = 1
    {
      pubCamera: true,
      pubAudio: true,
      classControl: true,
      shareMenu: true,
      shareDocument: true,
      shareDesktop: true,
      shareMedia: true,
      draw: true,
    },
    // ROLE.AUDIENCE = 2
    {
      pubCamera: true,
      pubAudio: true,
      classControl: false,
      shareMenu: false,
      shareDocument: false,
      shareDesktop: true,
      shareMedia: false,
      draw: false,
    },
  ];

  constructor(
    private logger: LoggerService,
  ) {
    this.me.id = this.genPeerId();
    this.me.displayName = this.me.id;
    this.logger.debug('peerId: %s', this.me.id);

    this.mainVideoDeviceId = localStorage.getItem('WiLearning.device.mainvideo.id');
    this.mainAudioDeviceId = localStorage.getItem('WiLearning.device.mainaudio.id');
    this.mainVideoResolution = +localStorage.getItem('WiLearning.device.mainvideoresolution.index');

    this.language = navigator.language;
  }

  get privilege() {
    return this.privilegeAll[this.me.roler];
  }

  setRoler(roler) {
    this.me.roler = roler;
  }

  genPeerId() {
    let peerId = sessionStorage.getItem('WiLearning.peerId');
    if ( !peerId ) {
      peerId = makeRandomString(8);
      sessionStorage.setItem('WiLearning.peerId', peerId);
    }

    return peerId;
  }

  switchBoardComponent(comp: WlBoardComp) {
    this.boardComponent = comp;
  }
}
