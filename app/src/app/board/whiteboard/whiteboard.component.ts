import { Component, OnInit } from '@angular/core';
import { PeerService } from '../../service/peer.service';

@Component({
  selector: 'app-whiteboard',
  templateUrl: './whiteboard.component.html',
  styleUrls: ['./whiteboard.component.scss'],
})
export class WhiteboardComponent implements OnInit {

  constructor(
    private peer: PeerService,
  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.peer.cameraToggleSide(true);
    });
  }

}
