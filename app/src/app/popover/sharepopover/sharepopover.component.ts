import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../service/profile.service';
import { WlBoardComp } from '../../defines';
import { PeerService } from '../../service/peer.service';
import { EventbusService, EventType } from '../../service/eventbus.service';
import { I18nService } from '../../service/i18n.service';

@Component({
  selector: 'app-sharepopover',
  templateUrl: './sharepopover.component.html',
  styleUrls: ['./sharepopover.component.scss'],
})
export class SharepopoverComponent implements OnInit {

  constructor(
    public profile: ProfileService,
    public peer: PeerService,
    public i18n: I18nService,
    private eventbus: EventbusService,
  ) { }

  ngOnInit() {}

  openVideo() {
    this.profile.switchBoardComponent(WlBoardComp.video);
    this.closeWindow();
  }

  async shareDesktop() {
    this.closeWindow();
    if (this.peer.pScreen) {
      this.profile.switchBoardComponent(WlBoardComp.sharescreen);
    } else if (await this.peer.startScreenShare()) {
      this.profile.switchBoardComponent(WlBoardComp.sharescreen);
    }
  }

  shareMedia() {
    this.profile.switchBoardComponent(WlBoardComp.sharemedia);
    this.closeWindow();
  }

  openDocument() {
    this.profile.switchBoardComponent(WlBoardComp.document);
    this.closeWindow();
  }

  closeWindow() {
    this.eventbus.popover$.next({
      type: EventType.popover_shareClosed,
    });
  }
}
