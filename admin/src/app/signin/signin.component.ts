import { Component, OnInit } from '@angular/core';
import { I18nService } from '../service/i18n.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {

  userForm: FormGroup;
  selectedLang = 'cn';
  username;
  password;

  constructor(
    public i18n: I18nService,
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService,
  ) { }

  ngOnInit(): void {
    this.userForm = this.fb.group({
      user: ['admin', Validators.required],
      password: [
        'admin',
        [
          Validators.minLength(3),
          Validators.maxLength(10)
        ]
      ],
    });
  }

  login() {
    this.username = this.userForm.get('user');
    this.password = this.userForm.get('password');
    this.auth.isLoggedIn = true;

    this.router.navigate(['/nav']);

  }

  langSelect() {
    this.i18n.setLocale(this.selectedLang);
  }
}
