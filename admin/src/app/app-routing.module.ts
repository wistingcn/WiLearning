import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoomComponent } from './room/room.component';
import { SigninComponent } from './signin/signin.component';
import { AuthGuard } from './auth.guard';
import { NavComponent } from './nav/nav.component';
import { MonitorComponent } from './monitor/monitor.component';


const routes: Routes = [
  {path: 'sigin', component: SigninComponent},
  {
    path: 'nav', component: NavComponent, canActivate: [AuthGuard],
    children: [
      {path: '', redirectTo: 'room', pathMatch: 'full'},
      {path: 'room', component: RoomComponent},
      {path: 'monitor', component: MonitorComponent},
    ]
  },
  {path: '**', component: RoomComponent, canActivate: [AuthGuard]}
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes,
    )
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
