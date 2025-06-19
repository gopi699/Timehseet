
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DbservicesService } from '../dbservices.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

interface Timesheet {
  id: number;
  employee_Name:string;
  client_Description:string;
  project_Name:string;
  work_Description:string;
  date:string;
  work_Hour:string;
  remarks:string;
  statusColor:string;
status:string;
selected:any;
user_Pk_Id:any;
}

@Component({
  selector: 'app-approval',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './approval.component.html',
  styleUrls: ['./approval.component.scss']
})
export class ApprovalComponent implements OnInit {
  timesheets: Timesheet[] = [];
  filteredTimesheets: Timesheet[] = [];
  paginatedTimesheets: Timesheet[] = [];
  currentPage: number = 1; // Pagination control
  pageSize: number = 10; // Number of entries per page
  searchQuery: string = ''; // Search query
  submittedTimesheets: any[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  showApprovalForm: boolean = false;
  selectedTimesheet: any = null;
  checkedList: any[] = [];
  stickyForm!: FormGroup;
  Employees: any[] = [];
  clients: any[] = [];
  projects: any[] = [];
  fromDate: any[] = [];
  toDate: any[] = [];
  status:any[] = [];

  constructor(
    private dbservicesService: DbservicesService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd && event.url.includes('/approval')))
      .subscribe(() => {
        this.getSubmittedTimesheets();
      });
  }
  isAllApprovedOrRejected(): boolean {
    return [...this.paginatedTimesheets, ...this.submittedTimesheets]
        .every(ts => ts.status === 'Approved' || ts.status === 'Reject');
}


  ngOnInit(): void {
    this.getSubmittedTimesheets();
    this.stickyForm = this.fb.group({
      employee_Pk_Id: [''],
      client_Pk_Id: [''],
      project_Pk_Id: [''],
      fromDate: [''],
      toDate: [''],
      pk_Status_Id:['']
    });

    this.dbservicesService.GetUserList({}).subscribe(
      (response: any) => {
        this.Employees = response;
      },
      (error: any) => {
        console.error('Failed to fetch employees', error);
      }
    );

    this.stickyForm.get('employee_Pk_Id')?.valueChanges.subscribe(employeeId => {
      if (employeeId) {
        this.Fetch_Project(employeeId);
      }
    });

    this.dbservicesService.getClientMaster({}).subscribe(
      (response: any) => {
        this.clients = response;
      },
      (error: any) => {
        console.error('Failed to fetch clients', error);
      }
    );

    this.stickyForm.get('client_Pk_Id')?.valueChanges.subscribe(clientId => {
      this.Fetch_Project(clientId);
    });

    this.dbservicesService.getStatusMaster({}).subscribe(
      (response: any) => {
        this.status = response;
      },
      (error: any) => {
        console.error('Failed to fetch Status', error);
      }
    );
    
  }

  Fetch_Project(clientId: any) {
    this.dbservicesService.GetProjectMaster({ client_Pk_Id: clientId }).subscribe(
      (response: any) => {
        this.projects = response;
      },
      (error: any) => {
        console.error('Failed to fetch projects', error);
      }
    );
  }

  getSubmittedTimesheets(): void {
    const userId: number = Number(sessionStorage.getItem('userId'));
    this.isLoading = true;
    this.errorMessage = '';
    
    this.dbservicesService.GetApproveTimesheetList({}).subscribe(
      (response: any) => {
        this.isLoading = false;
  
        if (Array.isArray(response)) {
          // Sort the response based on the created date or id to show the newest first
          this.submittedTimesheets = response.sort((a, b) => {
            // Assuming the timesheets have a 'createdDate' or 'id' field
            // Replace 'createdDate' with your actual date or timestamp field if different
            return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
          });
          this.updatePagination();
        } else {
          this.submittedTimesheets = [];
          this.paginatedTimesheets = [];
        }
        this.cdr.detectChanges();
      },
      (error: any) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load timesheets.';
        console.error('Error fetching timesheets:', error);
      }
    );
  }
  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'blue';
      case 'approved':
        return 'green';
      case 'reject':
        return 'red';
      default:
        return 'black';
    }
  }

  // Pagination logic
  get totalPages(): number {
    return Math.ceil(this.submittedTimesheets.length / this.pageSize);
  }

  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedTimesheets = this.submittedTimesheets.slice(startIndex, endIndex);
  
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.changePage(this.currentPage + 1);
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.changePage(this.currentPage - 1);
    }
  }

  pushCheckedList(id: any): void {
    this.checkedList.push(id);
  }

  oneTimeSheet(PK_ID: any, pk_Status: any): void {
    const payload = {
      pk_Status_Id: pk_Status,
      "approver_Timesheet": [
        {
          "pk_Timesheet_Details_Id": PK_ID
        }
      ]
    };
    this.checkedList.forEach((data: any) => {
      payload.approver_Timesheet.push(data);
    });
    this.approveOrReject(payload);
  }

  bulkTimeSheet(pk_Status_Id: any): void {
    const payload = {
      pk_Status_Id,
      "approver_Timesheet": this.checkedList.map((id: any) => ({ "pk_Timesheet_Details_Id": id }))
    };
    this.approveOrReject(payload);
  }

  approveOrReject(payload: any): void {
    this.dbservicesService.ApprovalUpdateStatus(payload).subscribe(
      (response: any) => {
        window.location.reload();
      },
      (error: any) => {
        console.error('Failed to update Approval Status', error);
      }
    );
  }

  // toggleSelectAll(event: Event): void {
  //   const target = event.target as HTMLInputElement;
  //   this.submittedTimesheets.forEach(timesheet => {
  //     if (!timesheet.disabled) { // Check if the checkbox is not disabled
  //       timesheet.selected = target.checked;
  //   }
  //   });
  // }
  toggleSelectAll(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.submittedTimesheets.forEach(timesheet => {
      if (timesheet.status !== 'Approved' && timesheet.status !== 'Reject') {
        timesheet.selected = target.checked;  // Check only if it's not Approved/Rejected
      } else {
        timesheet.selected = false;  // Keep disabled checkboxes unchecked
      }
    });
  }
  

  approveEntry(timesheet: any): void {
    timesheet.status = 'Approved';
    timesheet.statusColor = 'green';
    const payload = {
      pk_Status_Id: 3,
      approver_Timesheet: [{ pk_Timesheet_Details_Id: timesheet.pk_Timesheet_Details_Id }]
    };
    this.approveOrReject(payload);
  }

  rejectEntry(timesheet: any): void {
    timesheet.status = 'Rejected';
    timesheet.statusColor = 'red';
    const payload = {
      pk_Status_Id: 4,
      approver_Timesheet: [{ pk_Timesheet_Details_Id: timesheet.pk_Timesheet_Details_Id }]
    };
    this.approveOrReject(payload);
  }

  approveAll(): void {
    this.submittedTimesheets.forEach(timesheet => {
      if (timesheet.selected) {
        this.approveEntry(timesheet);
      }
    });
  }

  rejectAll(): void {
    this.submittedTimesheets.forEach(timesheet => {
      if (timesheet.selected) {
        this.rejectEntry(timesheet);
      }
    });
  }

  openApprovalForm(timesheet: any): void {
    this.selectedTimesheet = timesheet;
    this.showApprovalForm = true;
  }

  closeApprovalForm(): void {
    this.showApprovalForm = false;
  }

  submitApproval(): void {
    this.closeApprovalForm();
  }

  onSearch(): void {
    const formData = this.stickyForm.getRawValue();
    const filteredData: any = {};
    Object.keys(formData).forEach((key) => {
      if (formData[key] && formData[key] !== '') {
        filteredData[key] = formData[key];
      }
    });

    if (Object.keys(filteredData).length === 0) {
      this.getSubmittedTimesheets();
      return;
    }

    this.isLoading = true;

    this.dbservicesService.GetApproveTimesheetList(filteredData).subscribe(
      (response: any) => {
        this.isLoading = false;

        if (Array.isArray(response) && response.length > 0) {
          this.submittedTimesheets = [...response];
          this.updatePagination();
        } else {
          this.submittedTimesheets = [];
          this.paginatedTimesheets = [];
        }
        this.cdr.detectChanges();
      },
      (error: any) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load timesheets.';
        console.error('Error fetching timesheets:', error);
      }
    );
  }
  exportToExcel() {
        if (this.paginatedTimesheets.length === 0) {
          alert('No records available to export');
          return;
        }
      
        // ✅ Remove "id" field from each timesheet before export
        const exportData = this.paginatedTimesheets.map(({ id, ...rest }) => rest);
      
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
        const workbook: XLSX.WorkBook = { Sheets: { 'Reimburse': worksheet }, SheetNames: ['Reimburse'] };
        XLSX.writeFile(workbook, 'Reimburse.xlsx');
      }
}