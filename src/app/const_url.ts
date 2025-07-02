export const hostIP = 'http://52.66.202.211:9636/';
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
export const Getdashboardprojectwiselist_URL = `${apiBase}Dashboard/GetDashboardprojectwiseList`;
export const Getdashboardprojecleavelist_URL = `${apiBase}Dashboard/GetDashboardleaveList`;
// Employee Master APIs
export const InsertEmployeeDetails_URL = `${apiBase}UserMaster/InsertEmployeeDetails`;
export const InsertEmpBankDetails_URL = `${apiBase}UserMaster/InsertEmpBankDetails`;
export const InsertEmpEducationDetails_URL = `${apiBase}UserMaster/InsertEmpEducationDetails`;
export const InsertEmpPreCompanyDetails_URL = `${apiBase}UserMaster/InsertEmpPreCompanyDetails`;
export const GetEntityList_URL = `${apiBase}Dropdown/GetEntityList`;
export const GetBuList_URL = `${apiBase}Dropdown/GetBuList`;
export const  Getprofile_URL = `${apiBase}UserMaster/InsertEmployeeProfileDetails`;
export const  Getpreviousweek_URL = `${apiBase}Timesheet/GetPreviousweekAllow`;
export const  Getdateofbirth_URL = `${apiBase}Dashboard/GetDateofBirthList`;
export const  Getdashboard_URL = `${apiBase}Dashboard/GetDashboardBoardNotices`;
export const Getrolelist_URL = `${apiBase}Dropdown/GetRoleList`;
export const GetEmployeeById_URL = `${apiBase}UserMaster/GetEmployeeById`;
export const GetEmployeeEduById_url = `${apiBase}UserMaster/GetEmployeeEduById`;
export const GetEmployeeBankById_URL = `${apiBase}UserMaster/GetEmployeeBankById`;
export const GetEmployeePreCompById_URL = `${apiBase}UserMaster/GetEmployeePreCompById`;
export const GetEmployeeProfById_URL = `${apiBase}UserMaster/GetEmployeeProfById`;
export const Getrole_URL = `${apiBase}Dropdown/GetUserList`;
export const Getdownloadnoticefile_URL = `${apiBase}Dashboard/DownloadNoticeFile`;


