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
import { HttpClient } from '@angular/common/http';
import { getHost } from '../define';
import { LoggerService } from '../service/logger.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { I18nService } from '../service/i18n.service';

@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.css']
})
export class MonitorComponent implements OnInit {
  rooms$;
  roomDetail;

  constructor(
    public i18n: I18nService,
    private http: HttpClient,
    private logger: LoggerService,
    private snackbar: MatSnackBar,
  ) {

  }

  ngOnInit(): void {
    this.getActiveRooms();
  }

  getActiveRooms() {
    const url = getHost() + '/room/active';
    this.rooms$ = this.http.get(url);
  }

  openDetail(room) {
    this.roomDetail = null;
    const url = getHost() + '/room/activeDetail/' + room.id;

    this.http.get(url).subscribe(res => {
      this.roomDetail = res;
      this.logger.debug(JSON.stringify(res));
    }, error => {
      this.snackbar.open('Get room detail error! ' + error.message, 'close', {duration: 5000});
    });
  }
}
