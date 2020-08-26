import { Component, OnInit, AfterViewInit } from '@angular/core';
import { PeerService } from '../../service/peer.service';
import { ClaMedia } from '../../defines';

@Component({
  selector: 'app-sharedesk',
  templateUrl: './sharedesk.component.html',
  styleUrls: ['./sharedesk.component.scss'],
})
export class SharedeskComponent implements OnInit, AfterViewInit {

  constructor(
    public peer: PeerService,
  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.peer.cameraToggleSide(true);
    });
  }

  ngAfterViewInit() {
  }

}
