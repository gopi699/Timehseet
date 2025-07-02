import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  API_URL,
  GetApproverList_URL,
  GetClientMaster_URL,
  GetDeleteTimesheet_URL,
  GetProjectMaster_URL,
  GetInsertTimeSheet_URL,
  GetRolebased_URL,
  GetTimesheets_URL,
  GetWorkCategory_URL,
  GetApproveTimesheetList_URL,
  ApprovalUpdateStatus_URL,
  GetUserList_URL,
  GetStatusMaster_URL,
  GetLeaveMaster_URL,
  InsertLeave_URL,
  UpdateLeave_URL,
  GetLeaveList_URL,
  GetLeaveListApp_URL,
  GetExpenseMaster_URL,
  InsertReimburse_URL,
  GetReimburse_URL,
  InsertUpload_URL,
  ProjectAllocated_URL,
  GetReimburseListApp_URL,
  UpdateReimburseStatus_URL,
  DownloadReimburseStatus_URL, 
  Getdashboardlisr_URL,
  Getdashboardprojectwiselist_URL,
  Getdashboardprojecleavelist_URL,
   InsertEmployeeDetails_URL,
  InsertEmpBankDetails_URL,
  InsertEmpEducationDetails_URL,
  InsertEmpPreCompanyDetails_URL,
    GetEntityList_URL,
  GetBuList_URL,
  Getprofile_URL,
  Getpreviousweek_URL,
  Getdateofbirth_URL,
  Getdashboard_URL,
  Getrolelist_URL,
  GetEmployeeById_URL,
  GetEmployeeEduById_url,
  GetEmployeeBankById_URL,
  GetEmployeePreCompById_URL,
  GetEmployeeProfById_URL, 
  Getrole_URL,
  Getdownloadnoticefile_URL
} from './const_url';

@Injectable({
  providedIn: 'root'
})
export class DbservicesService {
  submitTimesheet(formData: any) {
    throw new Error('Method not implemented.');
  }

  private userId: string = '';
  router: any;

  constructor(private http: HttpClient) {}

  // Removed duplicate APICall implementation
  // --- User ID ---
  setUserId(userId: string) {
    this.userId = userId;
  }

  getUserId(): string {
    return this.userId;
  }

  // --- Login ---
  checkUserAvailability(credentials: any): Observable<any> {
    return this.APICall(`${API_URL}/checkUser`, credentials);
  }

  login(credentials: any): Observable<any> {
    return this.APICall(API_URL, credentials);
  }

  // --- Masters & Lists ---
  getClientMaster(payload: any): Observable<any> {
    return this.APICall(GetClientMaster_URL, payload);
  }

  GetProjectMaster(payload: any): Observable<any> {
    return this.APICall(GetProjectMaster_URL, payload);
  }

  GetWorkCategory(payload: any): Observable<any> {
    return this.APICall(GetWorkCategory_URL, payload);
  }

  GetApproverList(payload: any): Observable<any> {
    return this.APICall(GetApproverList_URL, payload);
  }

  GetUserList(payload: any): Observable<any> {
    return this.APICall(GetUserList_URL, payload);
  }

  GetInsertTimeSheet(payload: any): Observable<any> {
    return this.APICall(GetInsertTimeSheet_URL, payload);
  }


  GetTimesheets(payload: any): Observable<any> {
    return this.APICall(GetTimesheets_URL, payload);
  }

  GetDeleteTimesheet(id: number): Observable<any> {
    return this.APICall(GetDeleteTimesheet_URL, { pk_Timesheet_Details_Id: id });
  }

  GetRoleBasedMenu(roleId: number): Observable<any> {
    return this.APICall(GetRolebased_URL, { roleId });
  }

  GetApproveTimesheetList(payload: any): Observable<any> {
    return this.APICall(GetApproveTimesheetList_URL, payload);
  }

  ApprovalUpdateStatus(payload: any): Observable<any> {
    return this.APICall(ApprovalUpdateStatus_URL, payload);
  }

  getStatusMaster(payload: any): Observable<any> {
    return this.APICall(GetStatusMaster_URL, payload);
  }

  getLeaveMaster(payload: any): Observable<any> {
    return this.APICall(GetLeaveMaster_URL, payload);
  }

  InsertLeave(payload: any): Observable<any> {
    return this.APICall(InsertLeave_URL, payload);
  }

  getLeaveList(payload: any): Observable<any> {
    return this.APICall(GetLeaveList_URL, payload);
  }

  getLeaveListApp(payload: any): Observable<any> {
    return this.APICall(GetLeaveListApp_URL, payload);
  }

  LeaveAppUpdateStatus(payload: any): Observable<any> {
    return this.APICall(UpdateLeave_URL, payload);
  }

  getExpenseMaster(payload: any): Observable<any> {
    return this.APICall(GetExpenseMaster_URL, payload);
  }

  InsertReimburse(payload: any): Observable<any> {
    return this.APICall(InsertReimburse_URL, payload);
  }

  GetReimburse(payload: any): Observable<any> {
    return this.APICall(GetReimburse_URL, payload);
  }
   
  downloadReimburseStatus(payload: any): Observable<Blob> {
  return this.http.post(DownloadReimburseStatus_URL, payload, { responseType: 'blob' });
}

  InsertReimburseUpload(payload: any): Observable<any> {
    return this.APICall(InsertUpload_URL, payload);
  }

  GetProjectAllocated(payload: { employeeID: string, projectID: number }): Observable<any> {
    return this.APICall(ProjectAllocated_URL, payload);
  }

  // --- Reimbursement Approval ---
getReimburseListApp(payload: any): Observable<any> {
  return this.APICall(GetReimburseListApp_URL, payload);
}

  UpdateReimburseStatus(payload: { pk_Status_Id: number; approver_Reimburse: { pk_Reimburse_Id: any; }[]; }): Observable<any> {
  return this.APICall(UpdateReimburseStatus_URL, payload);
}

  ReimburseAppUpdateStatus(payload: any): Observable<any> {
    return this.APICall(UpdateReimburseStatus_URL, payload);
  }
Getdashboardlist(payload: any): Observable<any> {
  return this.APICall(Getdashboardlisr_URL, payload); 
}

Getdashboardprojectlist(payload: any): Observable<any> {
  return this.APICall(Getdashboardprojectwiselist_URL, payload); 
}

// --- Employee Master APIs ---
InsertEmployeeDetails(payload: any): Observable<any> {
  return this.APICall(InsertEmployeeDetails_URL, payload);
}

InsertEmpBankDetails(payload: any): Observable<any> {
  return this.APICall(InsertEmpBankDetails_URL, payload);
}

InsertEmpEducationDetails(payload: any): Observable<any> {
  return this.APICall(InsertEmpEducationDetails_URL, payload);
}

InsertEmpPreCompanyDetails(payload: any): Observable<any> {
  return this.APICall(InsertEmpPreCompanyDetails_URL, payload);
}

Getdashboardleavelist(payload: any): Observable<any> {
  return this.APICall(Getdashboardprojecleavelist_URL, payload); 
}
getEntityList(payload: any): Observable<any> {
  return this.APICall(GetEntityList_URL, payload);
}

getBuList(payload: any): Observable<any> {
  return this.APICall(GetBuList_URL, payload);
}

getprofile(payload: any): Observable<any> {
  return this.APICall(Getprofile_URL, payload);
}

getpreviousweek(payload: any): Observable<any> {
  return this.APICall(Getpreviousweek_URL, payload);
}

getdateofbirth(payload: any): Observable<any> {
  return this.APICall(Getdateofbirth_URL, payload);   
}

  getdashboard(payload: any): Observable<any> {
    return this.APICall(Getdashboard_URL, payload);
  }

  getrolelist(payload: any): Observable<any> {
    return this.APICall(Getrolelist_URL, payload);
  }

  GetEmployeeById(payload: any): Observable<any> {
    return this.APICall(GetEmployeeById_URL, payload);
  }
  GetEmployeeEduById(payload: any): Observable<any> {
    return this.APICall(GetEmployeeEduById_url, payload);
  }
  GetEmployeeBankById(payload: any): Observable<any> {
    return this.APICall(GetEmployeeBankById_URL, payload);
  }
  GetEmployeePreCompById(payload: any): Observable<any> {
    return this.APICall(GetEmployeePreCompById_URL, payload);
  }
  GetEmployeeProfById(payload: any): Observable<any> {
    return this.APICall(GetEmployeeProfById_URL, payload);
  }
  Getrole(payload: any): Observable<any> {
    return this.APICall(Getrole_URL, payload);
  }
  Getdownloadnoticefile(payload: any): Observable<any> {
    return this.APICall(Getdownloadnoticefile_URL, payload);
  }
  // --- Generic POST call ---
  APICall(url: string, payload: any): Observable<any> {
    return this.http.post<any>(url, payload);
  }
}
