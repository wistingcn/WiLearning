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
