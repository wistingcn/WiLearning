import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../service/profile.service';
import { ClaBoardComp } from '../../defines';
import { PeerService } from '../../service/peer.service';

@Component({
  selector: 'app-sharepopover',
  templateUrl: './sharepopover.component.html',
  styleUrls: ['./sharepopover.component.scss'],
})
export class SharepopoverComponent implements OnInit {

  constructor(
    private profile: ProfileService,
    public peer: PeerService,
  ) { }

  ngOnInit() {}

  openWelcome() {
    this.profile.boardComponent = ClaBoardComp.welcome;
  }

  openVideo() {
    this.profile.boardComponent = ClaBoardComp.video;
  }

  async shareDesktop() {
    if (this.peer.pScreen) {
      this.profile.boardComponent = ClaBoardComp.sharescreen;
    } else if (await this.peer.startScreenShare()) {
      this.profile.boardComponent = ClaBoardComp.sharescreen;
    }
  }

  shareMedia() {
    this.profile.boardComponent = ClaBoardComp.sharemedia;
  }

  openDocument() {
    this.profile.boardComponent = ClaBoardComp.document;
  }

  openWhiteBoard() {
    this.profile.boardComponent = ClaBoardComp.whiteboard;
  }
}
