import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Host } from '../define';
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
    const url = Host + '/room/active';
    this.rooms$ = this.http.get(url);
  }

  openDetail(room) {
    this.roomDetail = null;
    const url = Host + '/room/activeDetail/' + room.id;

    this.http.get(url).subscribe(res => {
      this.roomDetail = res;
      this.logger.debug(JSON.stringify(res));
    }, error => {
      this.snackbar.open('Get room detail error! ' + error.message, 'close', {duration: 5000});
    });
  }
}
