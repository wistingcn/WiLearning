import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public redirectUrl: string;
  public isLoggedIn = false;

  constructor() { }

  login(use: string, passwd: string) {
    this.isLoggedIn = true;
    return new Promise(resolve => {
      resolve(true);
    });
  }
}
