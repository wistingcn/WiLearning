/*
	 * Copyright (c) 2020 Wisting Team. <linewei@gmail.com>
	 *
	 * This program is free software: you can use, redistribute, and/or modify
	 * it under the terms of the GNU Affero General Public License, version 3
	 * or later ("AGPL"), as published by the Free Software Foundation.
	 *
	 * This program is distributed in the hope that it will be useful, but WITHOUT
	 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
	 * FITNESS FOR A PARTICULAR PURPOSE.
	 *
	 * You should have received a copy of the GNU Affero General Public License
	 * along with this program. If not, see <http://www.gnu.org/licenses/>.
*/
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../service/auth.service';
import { LoggerService } from '../service/logger.service';
import { I18nService } from '../service/i18n.service';
import { ProfileService } from '../service/profile.service';
import { WebsocketService } from '../service/websocket.service';
import { EventbusService, IEventType, EventType } from '../service/eventbus.service';
import { PeerService } from '../service/peer.service';
import { ROLE, ClaRoom, RoomStatus } from '../defines';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {
  userForm: FormGroup;
  selectedLang = this.i18n.locale;
  roler: ROLE;
  room: string;
  username: string;
  password: string;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private auth: AuthService,
    private logger: LoggerService,
    public i18n: I18nService,
    private profile: ProfileService,
    private socket: WebsocketService,
    private peer: PeerService,
    private snackBar: MatSnackBar,
    private eventbus: EventbusService,
  ) {
    if ( this.auth.redirectUrl ) {
      const index = this.auth.redirectUrl.indexOf('?');

      const search = this.auth.redirectUrl.slice(index);
      const url = new URLSearchParams(search);

      this.roler = +url.get('roler');
      this.room = url.get('room');
      this.username = url.get('user');
      this.password = url.get('password');

      this.logger.debug('url: %s, role: %s, room: %s, user: %s', this.auth.redirectUrl,
        this.roler, this.room, this.username);
    }

    this.eventbus.socket$.subscribe(async (event: IEventType) => {
      if ( event.type === EventType.socket_connected ) {
        if ( !this.profile.bLogin ) {
          this.profile.bLogin = true;
          await this.peer.init();
          await this.peer.roomUpdate();
          await this.peer.connectMediaServer();

          this.logger.debug('redirectUrl: %s', this.auth.redirectUrl);
          this.router.navigate([this.auth.redirectUrl || '/']);
        }
      }
    });
  }

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    this.userForm = this.fb.group({
      user: [this.username, Validators.required],
      password: [
        '1111',
        [
          Validators.minLength(3),
          Validators.maxLength(10)
        ]
      ],
      roles: [this.roler, Validators.required],
      room: [ this.room, Validators.required ],
    });
  }


  async login() {
    const user = this.userForm.get('user').value;
    const password = this.userForm.get('password').value;
    const roler = this.userForm.get('roles').value;
    const roomid = this.userForm.get('room').value;

    this.logger.debug('%s, %s,%s, %s, %s', user, password, roler, roomid);
    if (await this.auth.login(user, password)) {
      this.logger.debug('login successed!');

      this.profile.roomId = roomid;
      this.profile.me.displayName = user;
      this.profile.me.roler = +roler;

      this.profile.me.picture = `/avatar/${this.profile.me.displayName}.svg`;

      this.socket.connect();
    }
  }

  langSelect() {
    this.logger.debug('select lang : %s', this.selectedLang);
    this.i18n.setLocale(this.selectedLang);
  }
}
