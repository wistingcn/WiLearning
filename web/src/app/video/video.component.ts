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
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { LoggerService } from '../service/logger.service';
import { PeerService } from '../service/peer.service';
import { EventbusService, IEventType, EventType } from '../service/eventbus.service';
import { ProfileService } from '../service/profile.service';
import { I18nService } from '../service/i18n.service';
import { RoomLogoHeight, videoConstrain} from '../config';
import { ClaMedia, VIDEORESOLUTION } from '../defines';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { StreaminfoComponent } from '../container/streaminfo/streaminfo.component';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent implements OnInit, AfterViewInit {
  logoHeight = RoomLogoHeight;
  camera;

  constructor(
    public profile: ProfileService,
    public i18n: I18nService,
    public peer: PeerService,
    private dialog: MatDialog,
    private logger: LoggerService,
    private eventbus: EventbusService,
  ) {
  }

  ngOnInit() {
    if (this.profile.privilege.classControl) {
      navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: this.profile.mainVideoDeviceId,
          width: VIDEORESOLUTION[this.profile.mainVideoResolution].width,
          height: VIDEORESOLUTION[this.profile.mainVideoResolution].height,
          ...videoConstrain
        },
        audio: false
      }).then(stream => this.camera = stream);
    }
  }

  ngAfterViewInit() {
  }

  streamInfoDialog(stream: ClaMedia) {
    const dialogRef = this.dialog.open(StreaminfoComponent, {
      width: '40vw',
      data: {stream}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}
