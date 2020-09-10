import { Component, OnInit } from '@angular/core';
import { PeerService } from '../service/peer.service';
import { I18nService } from '../service/i18n.service';

@Component({
  selector: 'app-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss'],
})
export class MemberComponent implements OnInit {
  localCamera: MediaStream;
  constructor(
    public peer: PeerService,
    public i18n: I18nService,
  ) { }

  async  ngOnInit() {
  }

}
