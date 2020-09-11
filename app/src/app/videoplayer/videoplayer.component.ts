import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { WlMedia } from '../defines';
import { PeerService } from '../service/peer.service';

@Component({
  selector: 'app-videoplayer',
  templateUrl: './videoplayer.component.html',
  styleUrls: ['./videoplayer.component.scss'],
})
export class VideoplayerComponent implements OnInit {
  @Input() stream: WlMedia;
  @Input() toolbar = true;
  @Input() fullscreen = false;
  @ViewChild('videoplayer', {static: true}) videoplayer: ElementRef;

  constructor(
    public peer: PeerService,
  ) { }

  ngOnInit() {
    if (this.fullscreen) {
      (this.videoplayer.nativeElement as HTMLVideoElement).style.maxHeight = '100%';
    }
  }

  click(ev: Event) {
    console.log('click video');
    ev.preventDefault();

    this.stream.toggleSide = !this.stream.toggleSide;
  }
}
