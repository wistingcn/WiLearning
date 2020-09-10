import { Component, OnInit } from '@angular/core';
import { PeerService } from '../../service/peer.service';
import { ProfileService } from '../../service/profile.service';

@Component({
  selector: 'app-sharedesk',
  templateUrl: './sharedesk.component.html',
  styleUrls: ['./sharedesk.component.scss'],
})
export class SharedeskComponent implements OnInit {

  constructor(
    public peer: PeerService,
    public profile: ProfileService
  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.peer.cameraToggleSide(true);
    });
  }
}
