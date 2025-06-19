import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DbservicesService } from '../dbservices.service';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { HttpClient } from '@angular/common/http';

interface ReimburseList {
  pk_Reimburse_Id: number;
  user_Pk_Id: string;
  employee_Name: string;
  client_Description: string;
  project_Name: string;
  claim_Amount: number;
  expense_Description: string;
  kms: number;
  date: string;
  remarks: string;
  status: string;
  statusColor: string;
  selected?: boolean;
  rawDate?: string; 
}

@Component({
  selector: 'app-reimburseapproval',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './reimburseapproval.component.html',
  styleUrl: './reimburseapproval.component.css'
})
export class ReimburseApprovalComponent implements OnInit {
  Reimburselist: ReimburseList[] = [];
  filteredleave: ReimburseList[] = [];
  paginatedleave: ReimburseList[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  submittedreimburse: any[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  showApprovalForm: boolean = false;
  selectedleave: any = null;
  checkedList: any[] = [];
  stickyForm!: FormGroup;
  Employees: any[] = [];
  Leavetype: any[] = [];
  projects: any[] = [];
  clients: any[] = [];
  fromDate: any[] = [];
  toDate: any[] = [];
  status: any[] = [];

  constructor(
    private dbservicesService: DbservicesService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd && event.url.includes('/reimburseapproval')))
      .subscribe(() => {
        this.getSubmittedreimburse();
      });
  }

  isAllApprovedOrRejected(): boolean {
    return [...this.paginatedleave, ...this.submittedreimburse]
      .every(ts => ts.status === 'Approved' || ts.status === 'Reject');
  }

  ngOnInit(): void {
    this.getSubmittedreimburse();
    this.stickyForm = this.fb.group({
      employee_Pk_Id: [''],
      client_Pk_Id: [''],
      project_Pk_Id: [''],
      expense_Pk_Id: [''],
      date: [''],
      from_Date: [''],
      to_Date: [''],
      pk_Status_Id: ['']
    });

    this.dbservicesService.GetUserList({}).subscribe(
      (response: any) => this.Employees = response,
      (error: any) => console.error('Failed to fetch employees', error)
    );

    this.stickyForm.get('client_Pk_Id')?.valueChanges.subscribe(clientId => {
      this.Fetch_Project(clientId);
    });

    this.dbservicesService.getClientMaster({}).subscribe(
      (response: any) => this.clients = response,
      (error: any) => console.error('Failed to fetch clients', error)
    );

    this.dbservicesService.getLeaveMaster({}).subscribe(
      (response: any) => this.Leavetype = response,
      (error: any) => console.error('Failed to fetch Leavetype', error)
    );

    this.dbservicesService.getStatusMaster({}).subscribe(
      (response: any) => this.status = response,
      (error: any) => console.error('Failed to fetch Status', error)
    );
  }

  Fetch_Project(clientId: any) {
    this.dbservicesService.GetProjectMaster({ client_Pk_Id: clientId }).subscribe(
      (response: any) => this.projects = response,
      (error: any) => console.error('Failed to fetch projects', error)
    );
  }

  getSubmittedreimburse(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.dbservicesService.getReimburseListApp({}).subscribe(
      (response: any) => {
        this.isLoading = false;
        if (Array.isArray(response)) {
          this.submittedreimburse = response.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
          this.updatePagination();
        } else {
          this.submittedreimburse = [];
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
      case 'pending': return 'blue';
      case 'approved': return 'green';
      case 'reject': return 'red';
      default: return 'black';
    }
  }

  get totalPages(): number {
    return Math.ceil(this.submittedreimburse.length / this.pageSize);
  }

  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedleave = this.submittedreimburse.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.changePage(this.currentPage + 1);
  }

  previousPage() {
    if (this.currentPage > 1) this.changePage(this.currentPage - 1);
  }

  pushCheckedList(id: any): void {
    this.checkedList.push(id);
  }

  onereimburseonly(PK_ID: any, pk_Status: any): void {
    const payload = {
      pk_Status_Id: pk_Status,
      approve_Reimburse: [ { pk_Reimburse_Id: PK_ID } ]
    };
    this.checkedList.forEach((data: any) => {
      payload.approve_Reimburse.push(data);
    });
    this.approveOrReject(payload);
  }

  bulkreimburse(pk_Status_Id: any): void {
    const payload = {
      pk_Status_Id,
      approve_Reimburse: this.checkedList.map((id: any) => ({ pk_Reimburse_Id: id }))
    };
    this.approveOrReject(payload);
  }

  approveOrReject(payload: any): void {
    this.dbservicesService.ReimburseAppUpdateStatus(payload).subscribe(
      () => window.location.reload(),
      (error: any) => console.error('Failed to update Reimburse Approval Status', error)
    );
  }

  toggleSelectAll(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.submittedreimburse.forEach(reimburse => {
      reimburse.selected = reimburse.status !== 'Approved' && reimburse.status !== 'Reject' ? target.checked : false;
    });
  }

  approveEntry(reimburse: any): void {
    reimburse.status = 'Approved';
    reimburse.statusColor = 'green';
    const payload = {
      pk_Status_Id: 3,
      approve_Reimburse: [ { pk_Reimburse_Id: reimburse.pk_Reimburse_Id } ]
    };
    this.approveOrReject(payload);
  }

  rejectEntry(reimburse: any): void {
    reimburse.status = 'Rejected';
    reimburse.statusColor = 'red';
    const payload = {
      pk_Status_Id: 4,
      approve_Reimburse: [ { pk_Reimburse_Id: reimburse.pk_Reimburse_Id } ]
    };
    this.approveOrReject(payload);
  }

  approveAll(): void {
    this.submittedreimburse.forEach(reimburse => {
      if (reimburse.selected) this.approveEntry(reimburse);
    });
  }

  rejectAll(): void {
    this.submittedreimburse.forEach(reimburse => {
      if (reimburse.selected) this.rejectEntry(reimburse);
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
    for (const key in formData) {
      if (formData[key]?.toString().trim()) {
        filteredData[key] = formData[key];
      }
    }

    if (Object.keys(filteredData).length === 0) {
      this.getSubmittedreimburse();
      return;
    }

    this.isLoading = true;
    this.dbservicesService.getReimburseListApp(filteredData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (Array.isArray(response) && response.length > 0) {
          this.submittedreimburse = [...response];
          this.currentPage = 1;
          this.updatePagination();
        } else {
          this.submittedreimburse = [];
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

  downloadFile(pk_Reimburse_Id: string,date:string): void {
    const dateObj = new Date(date);
    const formattedDate = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')}`;

    const payload = { user_Pk_Id: pk_Reimburse_Id, date: formattedDate };
    this.dbservicesService.downloadReimburseStatus(payload).subscribe({
      next: (blob: Blob) => {
        const fileName = `Reimbursement_${pk_Reimburse_Id}`;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Download error:', err);
        alert("Download failed. Please try again.");
      }
    });
  }
}
