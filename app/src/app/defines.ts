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
import * as mediasoup from 'mediasoup-client';

export enum ROLE {
  MASTER = 1,
  AUDIENCE,
}
export enum CONNECT_VIDEO_STATUS {
  Null = 'null',
  Requested = 'requested',
  Connected = 'connected',
}

export class WlPeer {
  public id: string;
  public displayName: string;
  public roler = ROLE.AUDIENCE;
  public connectVideoStatus = CONNECT_VIDEO_STATUS.Null;
  public platform: string;
  public picture: string;
  public camStream?: WlMedia;
  public screenStream?: WlMedia;
  public mediaStream?: WlMedia;

  constructor(
    ) {
  }
}

export class WlMessage {
  constructor(
    public id: string,
    public peer: WlPeer,
    public who: string,
    public message: string,
    public recvTime: Date,
    public sendStatus: string,
    ) {
  }
}

export class WlFile {
  constructor(
    public name: string,
    public size: number,
    public blob: Blob,
  ) { }
}

export class WlMedia extends MediaStream {
  public videoConsumer?: mediasoup.types.Consumer;
  public audioConsumer?: mediasoup.types.Consumer;
  public peer?: WlPeer;
  public source?: string;
  public volume?: number;
  public producerScore?: number[] = [];
  public consumerScore?: number[] = [];
  public scoreIndex?: string[] = [];
  public toggleSide = false;
  public size = 6;

  constructor() {
    super();
  }
}

export enum RoomStatus {
  started = 'started',
  stopped = 'stopped',
}

export class WlClassroom {
  status: RoomStatus;
  startTime: number;
  stopTime: number;
  mutedAudio = false;
  mutedVideo = false;

  constructor() {

  }
}

export class WlRoomInfo {
  id: string;
  name: string;
  description;
  createTime;
  lastActiveTime;
  attendeePassword;
  speakerPassword;

  constructor() {}
}


export interface EmojiDialogData {
  animal: string;
  name: string;
}

export const VIDEORESOLUTION = [
  {
    width: 640,
    height: 360
  },
  {
    width: 640,
    height: 480
  },
  {
    width: 1280,
    height: 720
  }
];

export const SIMULCASTENCODING: RTCRtpEncodingParameters[] = [
  {maxBitrate: 100000},
  {maxBitrate: 300000},
  {maxBitrate: 900000}
];

export const SCREENSHARE_CONSTRAINTS = {
  video: {
    cursor: 'always'
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    sampleRate: 44100
  }
};

export enum RequestMethod {
  getRouterRtpCapabilities =  'getRouterRtpCapabilities' ,
  join = 'join',
  createWebRtcTransport = 'createWebRtcTransport',
  connectWebRtcTransport = 'connectWebRtcTransport',
  restartIce = 'restartIce',
  produce = 'produce',
  closeProducer = 'closeProducer',
  pauseProducer = 'pauseProducer',
  resumeProducer = 'resumeProducer',
  pauseConsumer = 'pauseConsumer',
  resumeConsumer = 'resumeConsumer',
  requestConsumerKeyFrame = 'requestConsumerKeyFrame',
  getProducerStats = 'getProducerStats',
  getConsumerStats = 'getConsumerStats',
  getTransportStats = 'getTransportStats',
  changeDisplayName = 'changeDisplayName',
  changePicture = 'changePicture',
  changeRoler = 'changeRoler',
  chatMessage = 'chatMessage',
  closePeer = 'closePeer',

  syncDocInfo = 'syncDocInfo',

  classStart = 'classStart',
  classStop = 'classStop',

  roomInfo = 'roomInfo',
  changeLogo = 'changeLogo',
  announcementText = 'announcementText',
  videoFilter = 'videoFilter',

  connectVideo = 'connectVideo',
  connectApproval = 'connectApproval',
  disconnectVideo = 'disconnectVideo',

  switchComponent = 'switchComponent',

  muted = 'muted',
  unmuted = 'unmuted',
}

export enum WlBoardComp {
  video = 'video',
  welcome = 'welcome',
  document = 'document',
  whiteboard = 'whiteboard',
  sharescreen = 'sharescreen',
  sharemedia = 'sharemedia',
}

export enum WlMediaSource {
  cameramic = 'cameramic',
  screen = 'screen',
  media = 'media',
}

export enum WlColor {
  primary = 'primary',
  secondary = 'secondary',
  tertiary = 'tertiary',
  success = 'success',
  warning = 'warning',
  danger = 'danger',
  light = 'light',
  medium = 'medium',
  dark = 'dark'
}

export class WlDocument {
  public id: number;
  public roomId: string;
  public uploadTime: string;
  public opened = false;
  constructor(
    public fileName: string,
  ) {}
}

export const makeRandomString = (length: number): string => {
    let outString = '';
    const inOptions = 'abcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
      outString += inOptions.charAt(Math.floor(Math.random() * inOptions.length));
    }

    return outString;
};

export const getImageMeta = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
  });
};
