import { Component, OnInit, AfterViewInit } from '@angular/core';
import { PeerService } from '../../service/peer.service';

@Component({
  selector: 'app-sharemedia',
  templateUrl: './sharemedia.component.html',
  styleUrls: ['./sharemedia.component.scss'],
})
export class SharemediaComponent implements OnInit, AfterViewInit {

  constructor(
    public peer: PeerService,
  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.peer.cameraToggleSide(true);
    });
  }

  ngAfterViewInit() {
    this.peer.cameraToggleSide(true);
  }

}
