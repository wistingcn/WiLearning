import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../service/profile.service';
import { ClaBoardComp } from '../../defines';
import { PeerService } from '../../service/peer.service';
import { EventbusService, EventType } from '../../service/eventbus.service';

@Component({
  selector: 'app-sharepopover',
  templateUrl: './sharepopover.component.html',
  styleUrls: ['./sharepopover.component.scss'],
})
export class SharepopoverComponent implements OnInit {

  constructor(
    public profile: ProfileService,
    public peer: PeerService,
    private eventbus: EventbusService,
  ) { }

  ngOnInit() {}

  openVideo() {
    this.profile.switchBoardComponent(ClaBoardComp.video);
    this.closeWindow();
  }

  async shareDesktop() {
    this.closeWindow();
    if (this.peer.pScreen) {
      this.profile.switchBoardComponent(ClaBoardComp.sharescreen);
    } else if (await this.peer.startScreenShare()) {
      this.profile.switchBoardComponent(ClaBoardComp.sharescreen);
    }
  }

  shareMedia() {
    this.profile.switchBoardComponent(ClaBoardComp.sharemedia);
    this.closeWindow();
  }

  openDocument() {
    this.profile.switchBoardComponent(ClaBoardComp.document);
    this.closeWindow();
  }

  closeWindow() {
    this.eventbus.popover$.next({
      type: EventType.popover_shareClosed,
    });
  }
}
