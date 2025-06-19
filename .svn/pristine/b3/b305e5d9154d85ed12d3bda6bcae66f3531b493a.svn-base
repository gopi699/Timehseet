import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DbservicesService } from '../dbservices.service';
import { EncryptionService } from '../login/login.component';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import Swal from 'sweetalert2';

interface LeaveList {
  id: number;
  EmpId: string;
  // EmpName: string;
  FromDate: string;
  ToDate: string;
  LeaveType: string;
  Reason: string;
  Approver: string;
  Status: string;
}


@Component({
  selector: 'app-applyleave',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatInputModule, MatDatepickerModule, MatNativeDateModule, MatFormFieldModule],
  providers: [DatePipe],
  templateUrl: './applyleave.component.html',
  styleUrl: './applyleave.component.css'
})

export class ApplyleaveComponent {
  paginatedLeave: LeaveList[] = [];
  Leavelist: LeaveList[] = [];
  filteredLeave: LeaveList[] = [];
  currentPage: number = 1; 
  pageSize: number = 10; 
  ApplyLeave!: FormGroup;
  Leave: any[] = [];
  Approver: any[] = [];
  isLoading: boolean = false;
  selectedDate: any;
  from_Date: string = '';
  myDate: Date = new Date();
  roleId: any;
 
  //searchQuery: string = '';
  submittedLeave: LeaveList[] = [];
 
  constructor(
    private dbService: DbservicesService,
    private fb: FormBuilder,
    private encryptionService: EncryptionService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    
    this.roleId = sessionStorage.getItem("roleId");
    console.log(this.roleId);
    // this.formattedDate = this.datePipe.transform(this.fromDate, 'yyyy-MM-dd')!;
    // console.log(this.formattedDate);  // Output: "2025-02-18"
    this.fetchData();
    this.loadLeaveListFromAPI();
    this.ApplyLeave = this.fb.group({
      from_Date: ['', Validators.required],
      to_Date: ['', Validators.required],
      leave_Pk_Id: [null, Validators.required],
      reason: ['', Validators.required],
      approved_By: [null, Validators.required]
    });

  };

  myFilter = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    return day !== 0; // 0 represents Sunday in JavaScript's Date object
  };

  private fetchData() {
    this.dbService.getLeaveMaster({}).subscribe(
      (response: any) => {
        this.Leave = response;
        //console.log('Leave:', this.Leave);
      },
      (error: any) => {
        console.error('Failed to fetch Leavetype', error);
      }
    );
    this.dbService.GetApproverList({}).subscribe(
      (response: any) => {
        this.Approver = response;
        //console.log('Approver:', this.Approver);
      },
      (error: any) => {
        console.error('Failed to fetch Approvers', error);
      }
    );
  }
  // formattedDate: string = '';
  onApply(): void {
    const formData = this.ApplyLeave.getRawValue();
    //console.log("leave", formData);
    //console.log(formData.from_Date);
    // const fromDate = formData.from_Date;  

    // if (fromDate) {
    //   const formattedDate = this.datePipe.transform(new Date(fromDate), 'yyyy-MM-dd');
    //   console.log("Formatted From Date:", formattedDate);  
    //   formData.from_Date = formattedDate;
    // }

    this.isLoading = true;
    this.dbService.InsertLeave(formData).subscribe(
      response => {
        //console.log('Success:', response);

        if (response[0].statuscode == 200) {
          Swal.fire({
            text: response[0].description,
            icon: 'success',
            confirmButtonText: 'OK'
          }).then(() => {
            this.ApplyLeave.reset();

            this.cdr.detectChanges();
            window.location.reload();
            //this.router.navigate(['layout/view']);
          });
        } else {
          Swal.fire({
            text: response[0].description,
            icon: 'error',
            showConfirmButton: true,
            confirmButtonText: 'OK',
            title: ''
          })
        }
      },
      error => {
        console.error('Error:', error);

        Swal.fire({
          title: 'Error!',
          text: 'Failed to submit the form. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    );
  }
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';

    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
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
    return Math.ceil(this.Leavelist.length / this.pageSize);
  }

  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedLeave = this.Leavelist.slice(startIndex, endIndex);
  
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


  loadLeaveListFromAPI() {
    this.isLoading = true;
    const userId: any = Number(sessionStorage.getItem('userId'));
    const payload: any = { user_Pk_Id: userId };

    this.dbService.getLeaveList(payload).subscribe(
      (data: any[]) => {
        //console.log("API Response:", data);

        if (data && data.length > 0) {
          this.Leavelist = data.map((ts: any): LeaveList => ({
            id: ts.Pk_Leave_Details_Id,
            EmpId: ts.user_Pk_Id || 'N/A',
            FromDate: this.formatDate(ts.from_Date),
            ToDate: this.formatDate(ts.to_Date),
            LeaveType: ts.leave_Description || 'N/A',
            Reason: ts.reason || 'N/A',
            Approver: ts.approved_By || '',
            Status: ts.status || 'Pending'
          }));

          // ✅ Ensure newly added timesheets appear first
          this.Leavelist.sort((a, b) => b.id - a.id);  // Sort by ID (assuming higher ID means newer record)

          this.filteredLeave = [...this.Leavelist];

          // ✅ Always show the latest data on the first page
          this.currentPage = 1;
          this.updatePagination();
          //this.timesheetService.setSubmittedTimesheets(this.Leavelist);
        } else {
          console.warn("No data received from API.");
        }
      },
      (error) => {
        console.error("Error fetching timesheets:", error);
      },
      () => {
        this.isLoading = false;
      }
    );
  }
}
