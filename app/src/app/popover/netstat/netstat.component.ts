import { Component, OnInit } from '@angular/core';
import { StatsService } from '../../service/stats.service';
import { I18nService } from '../../service/i18n.service';

@Component({
  selector: 'app-netstat',
  templateUrl: './netstat.component.html',
  styleUrls: ['./netstat.component.scss'],
})
export class NetstatComponent implements OnInit {

  constructor(
    public stats: StatsService,
    public i18n: I18nService,
  ) { }

  ngOnInit() {}

}
