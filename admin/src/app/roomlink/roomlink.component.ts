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
import { Component, OnInit, Inject } from '@angular/core';
import { I18nService } from '../service/i18n.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as Clipboard from 'clipboard';

@Component({
  selector: 'app-roomlink',
  templateUrl: './roomlink.component.html',
  styleUrls: ['./roomlink.component.css']
})
export class RoomlinkComponent implements OnInit {

  room;
  speakerUrl;
  attendeeUrl;
  clipboardSpeaker = new Clipboard('.btn-speaker');
  clipboardAttendee = new Clipboard('.btn-attendee');

  constructor(
    public i18n: I18nService,
    public dialogRef: MatDialogRef<RoomlinkComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
  ) {
    this.room = data.room;
    this.speakerUrl = `${location.origin}/web/?roler=1&room=${this.room.id}`;
    this.attendeeUrl = `${location.origin}/web/?roler=2&room=${this.room.id}`;
  }

  ngOnInit(): void {
  }

  openSpeakerUrl() {
    open(this.speakerUrl);
  }

  openAttendeeUrl() {
    open(this.attendeeUrl);
  }
}
