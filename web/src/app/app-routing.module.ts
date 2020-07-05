import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SigninComponent } from './signin/signin.component';
import { NavComponent } from './nav/nav.component';
import { GuardGuard } from './auth/guard.guard';


const routes: Routes = [
  {path: 'main', component: NavComponent, canActivate: [GuardGuard]},
  {path: 'sigin', component: SigninComponent},
  {path: '**', component: NavComponent, canActivate: [GuardGuard]},
];

@NgModule({
  imports: [ RouterModule.forRoot(routes)],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
