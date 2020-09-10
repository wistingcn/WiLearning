import { Component, OnInit, ElementRef } from '@angular/core';
import { PeerService } from '../../service/peer.service';
import { SharemediaService } from '../../service/sharemedia.service';
import { ProfileService } from '../../service/profile.service';

@Component({
  selector: 'app-sharemedia',
  templateUrl: './sharemedia.component.html',
  styleUrls: ['./sharemedia.component.scss'],
})
export class SharemediaComponent implements OnInit {

  constructor(
    public peer: PeerService,
    public sharemedia: SharemediaService,
    public profile: ProfileService,
  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.peer.cameraToggleSide(true);

      if (this.sharemedia.videoElement) {
        document.getElementById('sharemedia').appendChild(this.sharemedia.videoElement);
      }
    });
  }
}
