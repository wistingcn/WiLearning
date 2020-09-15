import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../service/profile.service';
import { PeerService } from '../../service/peer.service';
import { I18nService } from '../../service/i18n.service';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../../service/auth.service';
import { LoggerService } from '../../service/logger.service';
import {ROLE} from '../../defines';

@Component({
  selector: 'app-mainvideo',
  templateUrl: './mainvideo.component.html',
  styleUrls: ['./mainvideo.component.scss'],
})
export class MainvideoComponent implements OnInit {

  constructor(
    public profile: ProfileService,
    public peer: PeerService,
    public i18n: I18nService,
    private alert: AlertController,
    private auth: AuthService,
    private logger: LoggerService,
  ) { }

  async ngOnInit() {
    setTimeout(() => {
      this.peer.cameraToggleSide(false);
    });

  }

  async setAsPrompt() {
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
