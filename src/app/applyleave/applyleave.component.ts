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
  type: string;
  FromDate: string;
  ToDate: string;
  WorkingDate: string;
  LeaveDate: string;
  LeaveType: string;
  Reason: string;
  Approver: string;
  Status: string;
  ManagerRemarks: string; // ➡️ Added this line
}

@Component({
  selector: 'app-applyleave',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatInputModule, MatDatepickerModule, MatNativeDateModule, MatFormFieldModule],
  providers: [DatePipe],
  templateUrl: './applyleave.component.html',
  styleUrl: './applyleave.component.css'
})
export class ApplyleaveComponent {
  paginatedLeave: LeaveList[] = [];
  Leavelist: LeaveList[] = [];
  filteredLeave: LeaveList[] = [];
  regularizeList: LeaveList[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  ApplyLeave!: FormGroup;
  Leave: any[] = [];
  Approver: any[] = [];
  isLoading: boolean = false;
  myDate: Date = new Date();
  roleId: any;
  selectedType: string = '';
  showFromToDate: boolean = false;
  showWorkingLeaveDate: boolean = false;

  constructor(
    private dbService: DbservicesService,
    private fb: FormBuilder,
    private encryptionService: EncryptionService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.roleId = sessionStorage.getItem("roleId");
    this.fetchData();
    this.loadLeaveListFromAPI();

    this.ApplyLeave = this.fb.group({
      type: ['', Validators.required],
      leave_Pk_Id: [''],
      regularizeType: [''],
      from_Date: [''],
      to_Date: [''],
      working_Date: [''],
      leave_Date: [''],
      reason: ['', Validators.required],
      approved_By: ['300044']
    });
  }

  myFilter = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    return day !== 0;
  };

  private fetchData() {
    this.dbService.getLeaveMaster({}).subscribe({
      next: (res) => this.Leave = res,
      error: (err) => console.error('Leave fetch error:', err)
    });
    this.dbService.GetApproverList({}).subscribe({
      next: (res) => this.Approver = res,
      error: (err) => console.error('Approver fetch error:', err)
    });
  }

  onTypeChange(event: any) {
    const value = event.target.value;
    this.selectedType = value;
    this.showFromToDate = value === 'Leave';
    this.showWorkingLeaveDate = false;

    if (value === 'Leave') {
      this.ApplyLeave.get('leave_Pk_Id')?.setValidators([Validators.required]);
      this.ApplyLeave.get('regularizeType')?.clearValidators();
    } else if (value === 'Regularize') {
      this.ApplyLeave.get('regularizeType')?.setValidators([Validators.required]);
      this.ApplyLeave.get('leave_Pk_Id')?.clearValidators();
    } else {
      this.ApplyLeave.get('leave_Pk_Id')?.clearValidators();
      this.ApplyLeave.get('regularizeType')?.clearValidators();
    }

    this.ApplyLeave.get('leave_Pk_Id')?.updateValueAndValidity();
    this.ApplyLeave.get('regularizeType')?.updateValueAndValidity();

    this.ApplyLeave.patchValue({
      leave_Pk_Id: '',
      regularizeType: '',
      from_Date: '',
      to_Date: '',
      working_Date: '',
      leave_Date: ''
    });
  }

  onRegularizeTypeChange(event: any) {
    const value = event.target.value;
    if (value === 'On Duty') {
      this.showFromToDate = true;
      this.showWorkingLeaveDate = false;
    } else if (value === 'Comp Off') {
      this.showFromToDate = false;
      this.showWorkingLeaveDate = true;
    } else {
      this.showFromToDate = false;
      this.showWorkingLeaveDate = false;
    }

    this.ApplyLeave.patchValue({
      from_Date: '',
      to_Date: '',
      working_Date: '',
      leave_Date: ''
    });
  }

  onApply(): void {
    if (this.ApplyLeave.invalid) {
      this.markFormGroupTouched(this.ApplyLeave);
      Swal.fire('Validation Error', 'Please fill all required fields.', 'warning');
      return;
    }

    const formValue = this.ApplyLeave.getRawValue();

    if (formValue.type === 'Leave') {
      if (!formValue.leave_Pk_Id || !formValue.from_Date || !formValue.to_Date) {
        Swal.fire('Validation Error', 'Please fill required fields for Leave.', 'warning');
        return;
      }
    } else if (formValue.type === 'Regularize') {
      if (!formValue.regularizeType) {
        Swal.fire('Validation Error', 'Please select a Regularize Type', 'warning');
        return;
      }
      if (formValue.regularizeType === 'On Duty' && (!formValue.from_Date || !formValue.to_Date)) {
        Swal.fire('Validation Error', 'Please fill dates for On Duty', 'warning');
        return;
      }
      if (formValue.regularizeType === 'Comp Off' && (!formValue.working_Date || !formValue.leave_Date)) {
        Swal.fire('Validation Error', 'Please fill dates for Comp Off', 'warning');
        return;
      }
    }

    const payload = {
      user_Pk_Id: sessionStorage.getItem('userId'),
      type: formValue.type,
      leave_Pk_Id: formValue.type === 'Leave' ? formValue.leave_Pk_Id : null,
      type_Description: formValue.type === 'Regularize' ? formValue.regularizeType : null,
      from_Date: formValue.type === 'Leave' || formValue.regularizeType === 'On Duty' ? this.toISODate(formValue.from_Date) : null,
      to_Date: formValue.type === 'Leave' || formValue.regularizeType === 'On Duty' ? this.toISODate(formValue.to_Date) : null,
      working_Date: formValue.regularizeType === 'Comp Off' ? this.toISODate(formValue.working_Date) : null,
      leave_Date: formValue.regularizeType === 'Comp Off' ? this.toISODate(formValue.leave_Date) : null,
      reason: formValue.reason,
      approved_By: '300044',
      status: 'Pending'
    };

    console.log('Final Payload being sent to API:', payload);

    this.isLoading = true;
this.dbService.InsertLeave(payload).subscribe({
  next: (res) => {
    if (res[0]?.statuscode === 200) {
      Swal.fire('Success', res[0].description, 'success').then(() => {
        this.ApplyLeave.reset();
        this.loadLeaveListFromAPI();
      });
    } else {
      Swal.fire('Error', res[0]?.description || 'Submission failed', 'error');
    }
  },
  error: (err) => {
    console.error('Submission error:', err);
    Swal.fire('Error', 'Failed to submit request', 'error');
  },
  complete: () => {
    this.isLoading = false;
  }
});

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

  private toISODate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString();
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

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

  loadLeaveListFromAPI() {
    this.isLoading = true;
    const userId: any = Number(sessionStorage.getItem('userId'));
    const payload: any = { user_Pk_Id: userId };

    this.dbService.getLeaveList(payload).subscribe({
      next: (data: any[]) => {
        console.log('Raw Leave List API Response:', data);
       this.Leavelist = (data || []).map((item: any): LeaveList => {
  const isCompOff = item.type === 'Regularize' && item.type_Description === 'Comp Off';
const isOnDuty = item.type === 'Regularize' && item.type_Description === 'On Duty';

  return {
    id: item.pk_Leave_Details_Id || item.id,
    EmpId: item.user_Pk_Id || 'N/A',
    type: item.type || '',
FromDate: item.type === 'Leave' || isOnDuty ? this.formatDate(item.from_Date) : '',
ToDate: item.type === 'Leave' || isOnDuty ? this.formatDate(item.to_Date) : '',
WorkingDate: isCompOff ? this.formatDate(item.working_Date) : '',
LeaveDate: isCompOff ? this.formatDate(item.leave_Date) : '',
    LeaveType: item.type === 'Regularize'
      ? (item.type_Description || 'Regularize')
      : (item.leave_Description || 'Leave'),
    Reason: item.reason || 'N/A',
    Approver: item.approved_By || '',
    Status: item.status || 'Pending',
    ManagerRemarks: item.reject_Remarks || '' // ➡️ Added mapping here
  };
}).sort((a, b) => b.id - a.id);


        this.filteredLeave = [...this.Leavelist];
        this.regularizeList = this.Leavelist.filter(x => x.type === 'Regularize');

        this.currentPage = 1;
        this.updatePagination();
      },
      error: (err) => {
        console.error('Leave list error:', err);
        Swal.fire('Error', 'Failed to load leave data', 'error');
      },
      complete: () => this.isLoading = false
    });
  }
}
