import * as mediasoup from 'mediasoup-client';

export enum ROLE {
  SPEAKER = 1,
  AUDIENCE,
}
export enum CONNECT_VIDEO_STATUS {
  Null = 'null',
  Requested = 'requested',
  Connected = 'connected',
}

export class ClaPeer {
  public id: string;
  public displayName: string;
  public roler = ROLE.SPEAKER;
  public connectVideoStatus = CONNECT_VIDEO_STATUS.Null;
  public platform: string;
  public picture: string;
  public enableCam = false;
  public enableMic = false;

  constructor(
    ) {
  }
}

export class ClaMessage {
  constructor(
    public id: string,
    public peer: ClaPeer,
    public who: string,
    public message: string,
    public recvTime: Date,
    public sendStatus: string,
    ) {
  }
}

export class ClaFile {
  constructor(
    public name: string,
    public size: number,
    public blob: Blob,
  ) { }
}

export class ClaMedia extends MediaStream {
  public videoConsumer?: mediasoup.types.Consumer;
  public audioConsumer?: mediasoup.types.Consumer;
  public peer?: ClaPeer;
  public source?: string;
  public volume?: number;
  public producerScore?: number[] = [];
  public consumerScore?: number[] = [];
  public scoreIndex?: string[] = [];
  constructor() {
    super();
  }
}

export enum RoomStatus {
  started = 'started',
  stopped = 'stopped',
}

export class ClaRoom {
  id: string;
  name: string;
  password: string;
  status: RoomStatus;
  startTime: number;
  stopTime: number;
  logoUrl: string;
  announcementText: string;
  videoFilter: boolean;

  constructor() {

  }
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
