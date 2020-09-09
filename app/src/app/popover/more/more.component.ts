import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../service/profile.service';
import { ROLE } from '../../defines';
import { EventbusService, EventType } from '../../service/eventbus.service';
import { I18nService } from '../../service/i18n.service';

@Component({
  selector: 'app-more',
  templateUrl: './more.component.html',
  styleUrls: ['./more.component.scss'],
})
export class MoreComponent implements OnInit {

  chinese;
  constructor(
    public profile: ProfileService,
    public i18n: I18nService,
    private eventbus: EventbusService,
  ) {
    if (i18n.lang === i18n.cn) {
      this.chinese = true;
    }
  }

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

  chineseToggle() {
    if (this.chinese) {
      this.i18n.setLocale('zh-cn');
    } else {
      this.i18n.setLocale('en');
    }
  }
}
