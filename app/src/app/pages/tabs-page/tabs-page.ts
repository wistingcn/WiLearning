import { Component, OnInit } from '@angular/core';

@Component({
  templateUrl: 'tabs-page.html'
})
export class TabsPage implements OnInit {
  times = 0;
  constructor() {

  }

  ngOnInit() {

    setInterval(() => {
      this.times++;
    }, 1000);
  }
}
