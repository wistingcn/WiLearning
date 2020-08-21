import { Component, OnInit } from '@angular/core';
import { PeerService } from '../service/peer.service';

@Component({
  selector: 'app-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss'],
})
export class MemberComponent implements OnInit {
  localCamera: MediaStream;
  constructor(
    public peer: PeerService,
  ) { }

  async  ngOnInit() {
  }

}
