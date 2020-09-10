import { Injectable } from '@angular/core';
import { LoggerService } from './logger.service';
import { PeerService } from './peer.service';
import {WlMedia, WlMediaSource} from '../defines';

@Injectable({
  providedIn: 'root'
})
export class SharemediaService {
  shareVideoStream: MediaStream;
  videoElement: HTMLVideoElement;

  constructor(
    private logger: LoggerService,
    private peer: PeerService,
  ) {
  }


  exportVideo(videoElement) {
    const media = videoElement.captureStream();
    this.logger.debug('export media: %o.', media);

    this.peer.produceVideo(media, WlMediaSource.media);
    this.peer.produceAudio(media, WlMediaSource.media);

    this.shareVideoStream = media;
  }

  close() {
    this.peer.stopProduceStream(this.shareVideoStream as WlMedia);
    document.getElementById('sharemedia').removeChild(this.videoElement);
    this.shareVideoStream = null;
    this.videoElement = null;
  }

  fileChange(event) {
    this.logger.debug(event);

    const file = event.target.files[0] as File;
    if ( !file ) {
      return;
    }

    const shareObjSrc = URL.createObjectURL(file);
    this.videoElement = document.createElement('video');
    this.videoElement.src = shareObjSrc;
    this.videoElement.load();

    this.videoElement.addEventListener('loadeddata', () => {
      this.logger.debug('video %s loaded finished.', file.name);
      this.videoElement.muted = true;
      this.videoElement.play();
      this.videoElement.controls = true;
      this.exportVideo(this.videoElement);
    }, true);

    document.getElementById('sharemedia').appendChild(this.videoElement);
  }
}
