import { Routes } from '@angular/router';
import { AddformcreateComponent } from './addformcreate/addformcreate.component';
import { ViewformComponent } from './viewform/viewform.component';
import { LoginComponent } from './login/login.component';
import { LayoutComponent } from './layout/layout.component';
import { ApprovalComponent } from './approval/approval.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ApplyleaveComponent } from './applyleave/applyleave.component';
import { LeaveapprovalComponent } from './leaveapproval/leaveapproval.component';
import { AddreimburseComponent } from './addreimburse/addreimburse.component';
import { ViewreimburseComponent } from './viewreimburse/viewreimburse.component';
import { ReimburseApprovalComponent } from './reimburseapproval/reimburseapproval.component';


import { CanActivate, CanActivateChild, Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
 import { EmployeeMasterComponent } from './employee-master/employee-master.component';
// import { ClientMasterComponent } from './client-master/client-master.component';
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Fix redirect
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate:[AuthGuard],
    canActivateChild:[AuthGuard],
    children: [
      { path: 'addtimesheet', component: AddformcreateComponent, canActivate:[AuthGuard], },
      { path: 'view', component: ViewformComponent, canActivate:[AuthGuard], },
      { path: 'approval', component: ApprovalComponent, canActivate:[AuthGuard],}, 
      { path: 'dashboard', component: DashboardComponent, canActivate:[AuthGuard],}, 
      {path: 'applyleave', component:ApplyleaveComponent, canActivate:[AuthGuard],},
      {path: 'leaveapproval', component:LeaveapprovalComponent, canActivate:[AuthGuard]},
      {path: 'addreimburse',component:AddreimburseComponent, canActivate:[AuthGuard]},
      {path: 'viewreimburse',component:ViewreimburseComponent,canActivate:[AuthGuard]},
      { path: 'reimburseapproval', component:ReimburseApprovalComponent, canActivate: [AuthGuard] },

      {path: 'employee-Master',component:EmployeeMasterComponent,canActivate:[AuthGuard]}
      // {path: 'client-Master',component:ClientMasterComponent,canActivate:[AuthGuard]},
    ]
  }
];
