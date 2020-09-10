import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MemberComponent } from './member/member.component';
import { MainComponent } from './main/main.component';
import { LoginGuard } from './guard/login.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: MainComponent,
    canActivate: [LoginGuard]
  },
  {
    path: 'member',
    component: MemberComponent,
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginModule)
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
