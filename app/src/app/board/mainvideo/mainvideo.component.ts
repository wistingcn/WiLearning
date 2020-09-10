import { Component, OnInit, ViewEncapsulation, AfterViewInit  } from '@angular/core';
import { ProfileService } from '../../service/profile.service';
import { PeerService } from '../../service/peer.service';
import { I18nService } from '../../service/i18n.service';

@Component({
  selector: 'app-mainvideo',
  templateUrl: './mainvideo.component.html',
  styleUrls: ['./mainvideo.component.scss'],
})
export class MainvideoComponent implements OnInit, AfterViewInit {

  constructor(
    public profile: ProfileService,
    public peer: PeerService,
    public i18n: I18nService,
  ) { }

  async ngOnInit() {
    setTimeout(() => {
      this.peer.cameraToggleSide(false);
    });
  }

  ngAfterViewInit() {
  }
}
