/*
	 * Copyright (c) 2020 Wisting Team. <linewei@gmail.com>
	 *
	 * This program is free software: you can use, redistribute, and/or modify
	 * it under the terms of the GNU Affero General Public License, version 3
	 * or later ("AGPL"), as published by the Free Software Foundation.
	 *
	 * This program is distributed in the hope that it will be useful, but WITHOUT
	 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
	 * FITNESS FOR A PARTICULAR PURPOSE.
	 *
	 * You should have received a copy of the GNU Affero General Public License
	 * along with this program. If not, see <http://www.gnu.org/licenses/>.
*/
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
