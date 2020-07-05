import { Component, OnInit } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';
import { PeerService } from 'src/app/service/peer.service';
import { LoggerService } from 'src/app/service/logger.service';
import { EventbusService, EventType } from 'src/app/service/eventbus.service';
import { ProfileService } from 'src/app/service/profile.service';
import { I18nService } from 'src/app/service/i18n.service';

@Component({
  selector: 'app-share-video',
  templateUrl: './share-video.component.html',
  styleUrls: ['./share-video.component.css']
})
export class ShareVideoComponent implements OnInit {
  shareVideoFile: File;
  shareVideoStream: MediaStream;
  bShareObjSrc = false;

  constructor(
    public peer: PeerService,
    public logger: LoggerService,
    public i18n: I18nService,
    private eventbus: EventbusService,
    private elRef: ElementRef,
    private profile: ProfileService,
  ) { }

  ngOnInit() {
  }

  exportVideo(videoElement: any) {
    const media = videoElement.captureStream();
    this.logger.debug('export media: %o.', media);

    this.peer.produceVideo(media, 'media');
    this.peer.produceAudio(media, 'media');

    this.shareVideoStream = media;
  }

  selectFile(file: File) {
    if ( !file ) {
      return;
    }

    this.logger.debug('selectFile: %o', file);
    this.bShareObjSrc = true;

    setTimeout(() => {
      const player = this.elRef.nativeElement.querySelector('video') as HTMLVideoElement;
      try {
        player.srcObject = file;
      } catch (error) {
        player.src = URL.createObjectURL(file);
      }
      player.load();
      player.addEventListener('loadeddata', () => {
        this.logger.debug('video %s loaded finished.', file.name);
        player.muted = true;
        this.exportVideo(player);
      }, true);

    }, 200);
  }

  close() {
    this.eventbus.overlay$.next({
      type: EventType.overlay_shareMediaClosed
    });
    this.bShareObjSrc = false;
    this.peer.stopProduceStream(this.shareVideoStream);
    this.shareVideoStream = null;
  }
}
