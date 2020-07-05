import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { I18nService } from '../service/i18n.service';
import { Router, NavigationEnd } from '@angular/router';
import { LoggerService } from '../service/logger.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent {

  redirectedUrl: string;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(
    public i18n: I18nService,
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private logger: LoggerService,
    ) {
      this.router.events.subscribe(value => {
        if ( value instanceof NavigationEnd) {
          this.redirectedUrl = value.urlAfterRedirects;
        }
      });
    }

}
