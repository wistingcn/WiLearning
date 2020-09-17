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
import * as mediasoup from 'mediasoup-client';
import { LoggerService } from './logger.service';
import { WlMedia } from '../defines';

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  public device: mediasoup.types.Device = null;
  public sendTransport: mediasoup.types.Transport = null;
  public recvTransport: mediasoup.types.Transport = null;

  public videoDevices: MediaDeviceInfo[] = [];
  public audioDevices: MediaDeviceInfo[] = [];

  constructor(
    private logger: LoggerService,
  ) {
    this.logger.debug('mediasoup-client version: ', mediasoup.version);

    this.device = new mediasoup.Device();
    this.logger.debug('media handler name: ', this.device.handlerName);
  }

  async load(capability: {routerRtpCapabilities: mediasoup.types.RtpCapabilities}) {
    if ( this.device.loaded ) {
      return true;
    }

    try {
      await this.device.load(capability);
    } catch (error) {
      this.logger.error('load webrtc device error! : %o', error);
      return false;
    }

    this.logger.debug('device rtcCapabilities: %s', JSON.stringify(this.device.rtpCapabilities));
    this.logger.debug('device sctpCapabilities: %s', JSON.stringify(this.device.sctpCapabilities));

    return this.device.loaded;
  }

  createRecvTransport(options: mediasoup.types.TransportOptions) {
    return this.device.createRecvTransport(options);
  }

  createSendTransport(options: mediasoup.types.TransportOptions) {
    return this.device.createSendTransport(options);
  }

  async  setRecvTransport(transport: mediasoup.types.Transport) {
    this.recvTransport = transport;

    transport.on('connectionstatechange' , (connectState) => {
      this.logger.warn('Recv transport %s connectionstatechange : %s.', transport.id , connectState);
    });
  }

  setSendTransport(transport: mediasoup.types.Transport) {
    this.sendTransport = transport;
    transport.on('connectionstatechange' , (connectState) => {
      this.logger.warn('Send transport %s connectionstatechange : %s,%s', transport.id , connectState, transport.connectionState);
    });
  }

  async enumerateDevies() {
    this.videoDevices = [];
    this.audioDevices = [];

    const devices = await navigator.mediaDevices.enumerateDevices();
    this.logger.debug('enumerateDevices: ', devices);

    devices.forEach((device, index) => {
      if ( device.kind === 'videoinput') {
        this.videoDevices.push(device);
      } else if ( device.kind === 'audioinput') {
        if ( device.deviceId !== 'default') {
          this.audioDevices.push(device);
        }
      }
    });
  }

  checkRecorderType() {
    const win = window as any;
    if (win.MediaRecorder === undefined) {
      this.logger.error('MediaRecorder not supported.');
    } else {
      const contentTypes = [
        'video/webm',
        'video/webm;codecs=vp8',
        'video/webm;codecs=vp9',
        'video/webm;codecs=h264',
        'video/webm;codecs=h265',
        'video/webm;codecs=h264,opus',
        'video/webm;codecs=avc1',
        'audio/webm',
        'video/mp4;codecs=avc1',
        'video/mp4;codecs=h264',
        'video/mp4;codecs=h265',
      ];
      contentTypes.forEach(contentType => {
        this.logger.debug(contentType + ' is ' + (win.MediaRecorder.isTypeSupported(contentType) ?
                'supported' : 'NOT supported '));
      });
    }
  }
}

export class DisplayMediaScreenShare {
  pStream: MediaStream;
  constructor() {
    this.pStream = null;
  }

  start(constraints) {
    const navi = navigator as any;
    return navi.mediaDevices.getDisplayMedia(constraints) .then((stream) => {
        this.pStream = stream;

        return Promise.resolve(stream);
      });
  }

  stop() {
    this.pStream.getTracks().forEach((track) => {
      track.stop();
      this.pStream.removeTrack(track);
      track.dispatchEvent(new Event('ended'));
    });
    this.pStream = null;
  }
}
