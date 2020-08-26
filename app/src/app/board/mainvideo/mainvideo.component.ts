import { Component, OnInit, ViewEncapsulation, AfterViewInit  } from '@angular/core';
import { ProfileService } from '../../service/profile.service';
import { PeerService } from '../../service/peer.service';

@Component({
  selector: 'app-mainvideo',
  templateUrl: './mainvideo.component.html',
  styleUrls: ['./mainvideo.component.scss'],
})
export class MainvideoComponent implements OnInit, AfterViewInit {

  constructor(
    public profile: ProfileService,
    public peer: PeerService,
  ) { }

  async ngOnInit() {
    setTimeout(() => {
      this.peer.cameraToggleSide(false);
    });
  }

  ngAfterViewInit() {
  }
}
