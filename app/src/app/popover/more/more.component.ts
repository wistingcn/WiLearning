import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../service/profile.service';
import { ROLE } from '../../defines';
import { EventbusService, EventType } from '../../service/eventbus.service';
import { I18nService } from '../../service/i18n.service';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../../service/auth.service';
import { PeerService } from '../../service/peer.service';
import { ClassroomService } from '../../service/classroom.service';

@Component({
  selector: 'app-more',
  templateUrl: './more.component.html',
  styleUrls: ['./more.component.scss'],
})
export class MoreComponent implements OnInit {

  chinese;
  mutedAll = false;
  constructor(
    public profile: ProfileService,
    public i18n: I18nService,
    private eventbus: EventbusService,
    private alert: AlertController,
    private auth: AuthService,
    private peer: PeerService,
    private classroom: ClassroomService,
  ) {
    if (i18n.lang === i18n.cn) {
      this.chinese = true;
    }

    if (classroom.mutedAudio && classroom.mutedVideo ) {
      this.mutedAll = true;
    }
  }

  ngOnInit() {}

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

  mutedAllToggle() {
    if (this.mutedAll) {
      this.classroom.mutedAll();
    } else {
      this.classroom.unmutedAll();
    }
  }

  async setAsPrompt() {
    this.closeWindow();
    const alert = await this.alert.create({
      inputs: [
        {
          name: 'password',
          type: 'password',
          placeholder: this.i18n.lang.inputPresenterPassword
        }
      ],
      buttons: [
        {
          text: this.i18n.lang.cancel,
          role: 'cancel',
        },
        {
          text: this.i18n.lang.ok,
          handler: (value) => {
            this.setAsPresenter(value.password);
          }
        }
      ]
    });

    await alert.present();
  }

  async setAsPresenter(password) {
    this.auth.login({
      username: this.profile.me.displayName,
      password,
      roomId: this.profile.roomId,
      roler: ROLE.MASTER + ''
    }).then(() => {
      this.peer.setAsPresenter();
    }).catch(() => {

    });
  }
}
