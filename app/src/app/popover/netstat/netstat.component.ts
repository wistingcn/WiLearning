import { Component, OnInit } from '@angular/core';
import { StatsService } from '../../service/stats.service';

@Component({
  selector: 'app-netstat',
  templateUrl: './netstat.component.html',
  styleUrls: ['./netstat.component.scss'],
})
export class NetstatComponent implements OnInit {

  constructor(
    public stats: StatsService,
  ) { }

  ngOnInit() {}

}
