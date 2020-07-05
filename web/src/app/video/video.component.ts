import { Component, OnInit, AfterViewInit } from '@angular/core';
import { LoggerService } from '../service/logger.service';
import { PeerService } from '../service/peer.service';
import { EventbusService, IEventType, EventType } from '../service/eventbus.service';
import { ProfileService } from '../service/profile.service';
import { I18nService } from '../service/i18n.service';
import { RoomLogoHeight} from '../config';
import { ClaMedia } from '../defines';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { StreaminfoComponent } from '../container/streaminfo/streaminfo.component';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent implements OnInit, AfterViewInit {
  logoHeight = RoomLogoHeight;

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
