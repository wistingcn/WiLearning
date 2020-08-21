import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../service/profile.service';
import { BoardComp } from '../../defines';

@Component({
  selector: 'app-sharepopover',
  templateUrl: './sharepopover.component.html',
  styleUrls: ['./sharepopover.component.scss'],
})
export class SharepopoverComponent implements OnInit {

  constructor(
    private profile: ProfileService,
  ) { }

  ngOnInit() {}

  openWelcome() {
    this.profile.boardComponent = BoardComp.welcome;
  }

  openVideo() {
    this.profile.boardComponent = BoardComp.video;
  }

  shareDesktop() {

  }

  shareMedia() {

  }

  openDocument() {
    this.profile.boardComponent = BoardComp.document;
  }

  openWhiteBoard() {
    this.profile.boardComponent = BoardComp.whiteboard;
  }
}
