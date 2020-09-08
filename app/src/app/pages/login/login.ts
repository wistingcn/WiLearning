import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { LoggerService } from '../../service/logger.service';
import { ROLE } from '../../defines';
import { ProfileService } from '../../service/profile.service';

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
    private auth: AuthService,
    private logger: LoggerService,
    private profile: ProfileService,
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

  async onLogin(form: NgForm) {
    this.submitted = true;
    if (form.valid) {
      const logres = await this.auth.login({
        username: this.username,
        password: this.password,
        roler: this.roler + '',
        roomId: this.room,
      });

      if (logres) {
        this.profile.me.displayName = this.username;
        this.profile.me.roler = +this.roler;
        this.profile.roomId = this.room;

        this.router.navigateByUrl(this.auth.redirectUrl);
      }
    }
  }
}
