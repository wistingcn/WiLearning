import { Component, OnInit } from '@angular/core';
import { PeerService } from '../../service/peer.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent implements OnInit {

  constructor(
    private peer: PeerService,
  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.peer.cameraToggleSide(true);
    });
  }

}
