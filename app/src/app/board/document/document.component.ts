import { Component, OnInit, AfterViewInit } from '@angular/core';
import { PeerService } from '../../service/peer.service';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss'],
})
export class DocumentComponent implements OnInit, AfterViewInit {

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
