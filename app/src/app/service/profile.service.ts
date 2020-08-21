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
import {ROLE, ClaRoom, RoomStatus, BoardComp } from '../defines';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  public roomId = '1111';
  public forceTcp = false;
  public useSimulcast = false;
  public videoNav = true;

  public started = false; // Classroom status
  public startTime: number;
  public startTimeElapsed: number;
  public stopTime: number;
  public bClassStarter = false;

  public bLogin = false;
  public themeDark = false;
  public boardComponent = BoardComp.video;

  public room = new ClaRoom();

  public mainVideoDeviceId;
  public mainAudioDeviceId;
  public mainVideoResolution = 0;

  public me = new ClaPeer();

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
  ) {
    this.me.id = this.genPeerId();
    this.me.displayName = 'fakeName';
    this.logger.debug('peerId: %s', this.me.id);

    this.mainVideoDeviceId = localStorage.getItem('WiLearning.device.mainvideo.id');
    this.mainAudioDeviceId = localStorage.getItem('WiLearning.device.mainaudio.id');
    this.mainVideoResolution = +localStorage.getItem('WiLearning.device.mainvideoresolution.index');
  }

  get privilege() {
    return this.privilegeAll[this.me.roler];
  }

  genPeerId() {
    let peerId = sessionStorage.getItem('WiLearning.peerId');
    if ( !peerId ) {
      peerId = makeRandomString(8);
      sessionStorage.setItem('WiLearning.peerId', peerId);
    }

    return peerId;
  }

  /*
  async loadCamera() {
    this.camera = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
  }

  camera: MediaStream;
  streams = new Array<MediaStream>();
  rowNumber = [];
  colSize = 4;
  addStream() {
    this.streams.push(this.camera);
    this.calGrid();
  }

  subStream() {
    this.streams.pop();
    this.calGrid();
  }

  calGrid() {
    if (this.streams.length < 3) {
      if (this.rowNumber.length !== 1) {
        this.rowNumber.push('');
      }
      this.colSize = 12 / this.streams.length;
    } else {
      const streamNumber = Math.ceil(this.streams.length / 3);
      if (this.rowNumber.length > streamNumber) {
        for (let i = 0 ; i < this.rowNumber.length - streamNumber; i++) {
          this.rowNumber.pop();
        }
      } else if (this.rowNumber.length < streamNumber ) {
        for (let i = 0 ; i < streamNumber - this.rowNumber.length; i++) {
          this.rowNumber.push('');
        }
      }
      this.colSize = 4;
    }

    console.log(`colSize: ${this.colSize}, rowNumber: ${this.rowNumber}`);
  }
  */
}
