import { Component, OnInit, Input } from '@angular/core';
import { ClaMedia } from '../defines';

@Component({
  selector: 'app-videoplayer',
  templateUrl: './videoplayer.component.html',
  styleUrls: ['./videoplayer.component.scss'],
})
export class VideoplayerComponent implements OnInit {
  @Input() stream: ClaMedia;
  @Input() toolbar = true;

  constructor() { }

  ngOnInit() {}

  click(ev: Event) {
    console.log('click video');
    ev.preventDefault();

    this.stream.toggleBoard = !this.stream.toggleBoard;
  }
}
