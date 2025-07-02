import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DbservicesService } from '../dbservices.service';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

interface LeaveList {
  user_Pk_Id: any;
  display_Name: string;
  from_Date: string;
  to_Date: string;
  leave_Description: string;
  reason: string;
  approved_By: string;
  statusColor: string;
  status: string;
  selected: any;

}


@Component({
  selector: 'app-leaveapproval',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './leaveapproval.component.html',
  styleUrl: './leaveapproval.component.css'
})

export class LeaveapprovalComponent implements OnInit {
  Leavelist: LeaveList[] = [];
  filteredleave: LeaveList[] = [];
  paginatedleave: LeaveList[] = [];
  currentPage: number = 1; // Pagination control
  pageSize: number = 10; // Number of entries per page
  //searchQuery: string = ''; // Search query
  submittedleave: any[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  showApprovalForm: boolean = false;
  selectedleave: any = null;
  checkedList: any[] = [];
  stickyForm!: FormGroup;
  Employees: any[] = [];
  Leavetype: any[] = [];
  projects: any[] = [];
  fromDate: any[] = [];
  toDate: any[] = [];
  status: any[] = [];
  showRejectModal: boolean = false;
rejectRemarks: string = '';
rejectLeave: any = null;


  constructor(
    private dbservicesService: DbservicesService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd && event.url.includes('/leaveapproval')))
      .subscribe(() => {
        this.getSubmittedleave();
      });
  }
  isAllApprovedOrRejected(): boolean {
    return [...this.paginatedleave, ...this.submittedleave]
      .every(ts => ts.status === 'Approved' || ts.status === 'Reject');
  }


  ngOnInit(): void {
    this.getSubmittedleave();
    this.stickyForm = this.fb.group({
      employee_Pk_Id: [''],
      leave_Type: [''],
      from_Date: [''],
      to_Date: [''],
      pk_Status_Id: ['']
    });

    this.dbservicesService.GetUserList({}).subscribe(
      (response: any) => {
        this.Employees = response;
      },
      (error: any) => {
        console.error('Failed to fetch employees', error);
      }
    );

    this.dbservicesService.getLeaveMaster({}).subscribe(
      (response: any) => {
        this.Leavetype = response;
      },
      (error: any) => {
        console.error('Failed to fetch Leavetype', error);
      }
    );

    
    this.dbservicesService.getStatusMaster({}).subscribe(
      (response: any) => {
        this.status = response;
      },
      (error: any) => {
        console.error('Failed to fetch Status', error);
      }
    );

  }

  getSubmittedleave(): void {
    const userId: number = Number(sessionStorage.getItem('userId'));
    this.isLoading = true;
    this.errorMessage = '';

    this.dbservicesService.getLeaveListApp({}).subscribe(
      (response: any) => {
        this.isLoading = false;

        if (Array.isArray(response)) {
          // Sort the response based on the created date or id to show the newest first
          this.submittedleave = response.sort((a, b) => {
            // Assuming the timesheets have a 'createdDate' or 'id' field
            // Replace 'createdDate' with your actual date or timestamp field if different
            return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
          });
          this.updatePagination();
        } else {
          this.submittedleave = [];
          this.paginatedleave = [];
        }
        this.cdr.detectChanges();
      },
      (error: any) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load leaveList.';
        console.error('Error fetching LeaveList:', error);
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
    return Math.ceil(this.submittedleave.length / this.pageSize);
  }

  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedleave = this.submittedleave.slice(startIndex, endIndex);

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

  oneleaveonly(PK_ID: any, pk_Status: any): void {
    const payload = {
      pk_Status_Id: pk_Status,
      "approver_Leave": [
        {
          "pk_Leave_Details_Id": PK_ID
        }
      ]
    };
    this.checkedList.forEach((data: any) => {
      payload.approver_Leave.push(data);
    });
    this.approveOrReject(payload);
  }

  bulkleave(pk_Status_Id: any): void {
    const payload = {
      pk_Status_Id,
      "approver_Leave": this.checkedList.map((id: any) => ({ "pk_Leave_Details_Id": id }))
    };
    this.approveOrReject(payload);
  }

  approveOrReject(payload: any): void {
    this.dbservicesService.LeaveAppUpdateStatus(payload).subscribe(
      (response: any) => {
        window.location.reload();
      },
      (error: any) => {
        console.error('Failed to update Leave Approval Status', error);
      }
    );
  }
confirmReject(): void {
  if (!this.rejectRemarks || this.rejectRemarks.trim() === '') {
    alert('Please enter remarks to reject.');
    return;
  }

  const payload = {
    pk_Status_Id: 4,
    approver_Leave: [{
      pk_Leave_Details_Id: this.rejectLeave.pk_Leave_Details_Id,
      remarks: this.rejectRemarks
    }]
  };

  this.dbservicesService.LeaveAppUpdateStatus(payload).subscribe(
    (response: any) => {
      this.getSubmittedleave(); // reload leave data
      this.cancelReject();
    },
    (error: any) => {
      console.error('Failed to update Leave Reject Status', error);
      this.cancelReject();
    }
  );
}

cancelReject(): void {
  this.showRejectModal = false;
  this.rejectRemarks = '';
  this.rejectLeave = null;
}


  toggleSelectAll(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.submittedleave.forEach(leave => {
      if (leave.status !== 'Approved' && leave.status !== 'Reject') {
        leave.selected = target.checked;  // Check only if it's not Approved/Rejected
      } else {
        leave.selected = false;  // Keep disabled checkboxes unchecked
      }
    });
  }


  approveEntry(leave: any): void {
    leave.status = 'Approved';
    leave.statusColor = 'green';
    const payload = {
      pk_Status_Id: 3,
      approver_Leave: [{ pk_Leave_Details_Id: leave.pk_Leave_Details_Id }]
    };
    this.approveOrReject(payload);
  }

 rejectEntry(leave: any): void {
  this.rejectLeave = leave;
  this.showRejectModal = true;
}


  approveAll(): void {
    this.submittedleave.forEach(leave => {
      if (leave.selected) {
        this.approveEntry(leave);
      }
    });
  }

  rejectAll(): void {
    this.submittedleave.forEach(leave => {
      if (leave.selected) {
        this.rejectEntry(leave);
      }
    });
  }

  openApprovalForm(leave: any): void {
    this.selectedleave = leave;
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
  
    // Filter only fields with non-empty values
    for (const key in formData) {
      if (
        formData.hasOwnProperty(key) &&
        formData[key] !== null &&
        formData[key] !== undefined &&
        formData[key].toString().trim() !== ''
      ) {
        filteredData[key] = formData[key];
      }
    }
  
    console.log('Leave Filters:', filteredData);
  
    // If no filters are applied, fetch all leaves
    if (Object.keys(filteredData).length === 0) {
      this.getSubmittedleave();
      return;
    }
  
    this.isLoading = true;
    this.dbservicesService.getLeaveListApp(filteredData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
  
        if (Array.isArray(response) && response.length > 0) {
          this.submittedleave = [...response];
          this.currentPage = 1;
          this.updatePagination();
        } else {
          this.submittedleave = [];
          this.paginatedleave = [];
        }
  
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load leave data.';
        console.error('Error fetching leave data:', error);
      }
    });
  }
  
  
}