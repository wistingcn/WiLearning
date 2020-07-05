import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { LoggerService } from '../service/logger.service';

@Injectable({
  providedIn: 'root'
})
export class GuardGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private route: Router,
    private logger: LoggerService,
  ) {

  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      const url = state.url || '/';

      if ( this.auth.isLoggedIn ) {
        this.logger.debug('user has been loggedIn, return true');
        return true;
      }

      this.auth.redirectUrl = decodeURIComponent(url);
      this.route.navigate(['/sigin']);
      return false;
  }
}
