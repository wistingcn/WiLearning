import { getAttrsForDirectiveMatching } from '@angular/compiler/src/render3/view/util';
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
import { Injectable } from '@angular/core';
import * as CryptoJs from 'crypto-js';
import { WlhttpService } from './wlhttp.service';
import { LoggerService } from './logger.service';
import { AdminServer } from '../config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public redirectUrl: string;
  public isLoggedIn = false;

  constructor(
    private logger: LoggerService,
    private http: WlhttpService,
  ) {
  }
  login(userInfo: {username: string, password: string, roomId: string, roler}) {
    this.isLoggedIn = true;
    const cryptoPasswd = CryptoJs.MD5(userInfo.password).toString().toUpperCase();
    const loginUrl = `https://${AdminServer.address}/room/login/${userInfo.roomId}/${userInfo.roler}/${userInfo.username}/${cryptoPasswd}`;
    this.logger.debug('loginUrl : %s', loginUrl);

    return this.http.http.get(loginUrl).toPromise();
  }
}
