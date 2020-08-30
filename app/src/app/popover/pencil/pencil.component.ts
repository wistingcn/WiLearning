import { Component, OnInit } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { LoggerService } from '../../service/logger.service';
import { DrawtoolService } from '../../service/drawtool.service';

@Component({
  selector: 'app-pencil',
  templateUrl: './pencil.component.html',
  styleUrls: ['./pencil.component.scss'],
})
export class PencilComponent implements OnInit {
  prop = '';
  constructor(
    public drawtool: DrawtoolService,
    private navparams: NavParams,
    private logger: LoggerService,
  ) {
    this.prop = this.navparams.data.props;
    this.logger.debug(this.prop);
  }

  ngOnInit() {
    this.logger.debug(this.navparams);
  }

  selectColor(color: string) {

  }

  selectLineWeight(weight: number) {

  }

}
