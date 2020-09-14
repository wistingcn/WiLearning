import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { LoggerService } from '../../service/logger.service';
import { ROLE, WlRoomInfo } from '../../defines';
import { ProfileService } from '../../service/profile.service';
import { I18nService } from '../../service/i18n.service';
import { ToastController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { WlhttpService } from '../../service/wlhttp.service';
import { AdminServer } from '../../config';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
  styleUrls: ['./login.scss'],
})
export class LoginPage {
  submitted = false;

  roler: ROLE = ROLE.AUDIENCE;

  roomInit: string;
  usernameInit: string;

  room: string;
  username: string;

  password: string;

  constructor(
    public router: Router,
    public i18n: I18nService,
    private auth: AuthService,
    private logger: LoggerService,
    private profile: ProfileService,
    private toastController: ToastController,
    private alert: AlertController,
    private http: WlhttpService,
  ) {
    if ( this.auth.redirectUrl ) {
      const index = this.auth.redirectUrl.indexOf('?');

      const search = this.auth.redirectUrl.slice(index);
      const url = new URLSearchParams(search);

      const roler = +url.get('roler');
      if (roler === ROLE.AUDIENCE || roler === ROLE.MASTER) {
        this.roler = roler;
      }

      this.roomInit = this.room = url.get('room');
      this.usernameInit = this.username = url.get('user');

      this.logger.debug('url: %s, role: %s, room: %s, user: %s', this.auth.redirectUrl,
        this.roler, this.room, this.username);
    }
  }

  onLogin(form: NgForm) {
    this.submitted = true;
    if (form.valid) {
      this.auth.login({
        username: this.username.trim(),
        password: this.password.trim(),
        roler: this.roler + '',
        roomId: this.room.trim(),
      }).then(async (res) => {
        this.logger.debug(res);
        this.profile.me.displayName = this.username;
        this.profile.me.roler = +this.roler;
        this.profile.roomId = this.room;

        this.getRoomInfo(this.room);
      }).catch((err) => {
          this.logger.error(err);
          this.loginError(err);
      });
    }
  }

  async loginError(error) {
    let errorMessage = this.i18n.lang.unKnownError;
    if (error.error && error.error.code === 40411) {
        errorMessage = this.i18n.lang.loginErrorRoomNotExist;
    }

    if (error.error && error.error.code === 40412 ) {
        errorMessage = this.i18n.lang.loginErrorPassword;
    }

    const alertDialog = await this.alert.create({
        header: this.i18n.lang.alert,
        message: errorMessage,
        buttons: [this.i18n.lang.ok]
      });
    await alertDialog.present();
  }

  getRoomInfo(roomid) {
    const roomDetailUrl = `https://${AdminServer.address}/room/info/${roomid}`;
    this.http.http.get(roomDetailUrl).toPromise().then(roomInfo => {
        this.logger.debug('room info: ', roomInfo);
        this.profile.roomInfo = roomInfo as WlRoomInfo;
        this.router.navigateByUrl(this.auth.redirectUrl);
    }).catch(error => {
      this.logger.error(error.error);
    });
  }
}
