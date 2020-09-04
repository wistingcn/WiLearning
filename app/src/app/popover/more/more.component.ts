import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../service/profile.service';
import { ROLE } from '../../defines';
import { EventbusService, EventType } from '../../service/eventbus.service';

@Component({
  selector: 'app-more',
  templateUrl: './more.component.html',
  styleUrls: ['./more.component.scss'],
})
export class MoreComponent implements OnInit {

  constructor(
    public profile: ProfileService,
    private eventbus: EventbusService,
  ) { }

  ngOnInit() {}

  setAsMaster() {
    this.profile.setRoler(ROLE.MASTER);
    this.closeWindow();
  }

  closeWindow() {
    this.eventbus.popover$.next({
      type: EventType.popover_moreClosed,
    });
  }
}
