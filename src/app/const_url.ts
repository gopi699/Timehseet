const hostIP = 'http://52.66.202.211:9636/';
const apiBase = `${hostIP}api/`;

export const API_URL = `${apiBase}Login/LoginValidation`;

export const GetClientMaster_URL = `${apiBase}ClientMaster/GetClientMaster`;
export const GetProjectMaster_URL = `${apiBase}ProjectMaster/GetProjectMaster`;
export const ProjectAllocated_URL = `${apiBase}ProjectMaster/GetProjectAllocated`;

export const GetWorkCategory_URL = `${apiBase}WorkCategoryMaster/GeWorkCategoryMaster`;

export const GetApproverList_URL = `${apiBase}UserMaster/GetApproverList`;
export const GetUserList_URL = `${apiBase}UserMaster/GetUserList`;
export const GetRolebased_URL = `${apiBase}UserMaster/GetRoleBasedMenu`;

export const GetInsertTimeSheet_URL = `${apiBase}Timesheet/InsertTimeSheet`;
export const GetTimesheets_URL = `${apiBase}Timesheet/GetTimeSheetById`;
export const GetDeleteTimesheet_URL = `${apiBase}Timesheet/DeleteTimeSheet`;
export const GetApproveTimesheetList_URL = `${apiBase}Timesheet/GetApproveTimesheetList`;
export const ApprovalUpdateStatus_URL = `${apiBase}Timesheet/UpdateStatus`;
export const GetStatusMaster_URL = `${apiBase}Timesheet/GetStatusMaster`;

export const GetLeaveMaster_URL = `${apiBase}Leave/GetLeaveMaster`;
export const InsertLeave_URL = `${apiBase}Leave/InsertLeaveDetails`;
export const UpdateLeave_URL = `${apiBase}Leave/UpdateLeaveStatus`;
export const GetLeaveList_URL = `${apiBase}Leave/GetLeaveListById`;
export const GetLeaveListApp_URL = `${apiBase}Leave/GetApproveLeaveList`;

export const GetExpenseMaster_URL = `${apiBase}ExpenseMaster/GetExpenseMaster`;
export const InsertReimburse_URL = `${apiBase}Reimburse/InsertReimburse`;
export const GetReimburse_URL = `${apiBase}Reimburse/GetReimburseById`;
export const InsertUpload_URL = `${apiBase}Reimburse/UploadDocuments`;

export const GetReimburseListApp_URL = `${apiBase}Reimburse/GetApproveReimbuseList`;
export const UpdateReimburseStatus_URL = `${apiBase}Reimburse/UpdateReimburseStatus`;
export const DownloadReimburseStatus_URL = `${apiBase}Reimburse/DownloadFile`;
export const Getdashboardlisr_URL = `${apiBase}Dashboard/GetDashboardList`;
