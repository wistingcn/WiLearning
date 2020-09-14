import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { EventbusService, EventType, IEventType } from '../../service/eventbus.service';
import { I18nService } from '../../service/i18n.service';
import { LoggerService } from '../../service/logger.service';
import { ProfileService } from '../../service/profile.service';

@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss'],
})
export class InformationComponent implements OnInit {
  url;

  constructor(
    public profile: ProfileService,
    public i18n: I18nService,
    public auth: AuthService,
    private eventbus: EventbusService,
    private logger: LoggerService,
  ) {
  }

  ngOnInit() {
    if (this.auth.redirectUrl && this.auth.redirectUrl.match('room')) {
      this.url = this.auth.redirectUrl;
    } else {
      this.url = `${location.origin}/app?room=${this.profile.roomId}`;
    }
    this.logger.debug(this.url);

    document.getElementById('classInfo').innerHTML = this.profile.roomInfo.description;
  }

  close() {
    this.eventbus.popover$.next({
      type: EventType.popover_informationClosed
    });
  }

  copyInfo() {
    this.logger.debug('url: ', this.url);
    navigator.clipboard.writeText(this.url);
  }
}
