import { ChangeDetectorRef, Component } from '@angular/core';
import { DbservicesService } from '../dbservices.service';
import { EncryptionService } from '../login/login.component';
import { NavigationEnd, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { filter } from 'rxjs/operators';

interface ReimburseList {
  id: number;
  EmpId: string;
  Client: string;
  Project: string;
  Date: string;
  ClaimAmount: any;
  Expense: string;
  Approver: string;
  Remarks: any;
  Status: string;
  rawDate?: string; // ✅ Used for download payload
}

@Component({
  selector: 'app-viewreimburse',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './viewreimburse.component.html',
  styleUrl: './viewreimburse.component.css'
})
export class ViewreimburseComponent {
  paginatedReimburse: ReimburseList[] = [];
  Reimburse: ReimburseList[] = [];
  filteredReimburse: ReimburseList[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  Approver: any[] = [];
  isLoading: boolean = false;
  roleId: any;
  searchQuery: string = '';
  submittedReimburse: ReimburseList[] = [];

  constructor(
    private dbService: DbservicesService,
    private fb: FormBuilder,
    private encryptionService: EncryptionService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd && event.url.includes('/viewreimburse')))
      .subscribe(() => {
        console.log("Reloading Reimburse due to navigation change...");
        this.loadReimburseListFromAPI();
      });
  }

  ngOnInit() {
    this.roleId = sessionStorage.getItem("roleId");
    this.loadReimburseListFromAPI();
  }

  filterReimburse() {
    this.filteredReimburse = this.Reimburse.filter(entry =>
      Object.values(entry).some(value =>
        value?.toString().toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    );
    this.currentPage = 1;
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedReimburse = this.filteredReimburse.slice(startIndex, endIndex);
  }

  clearSearch() {
    this.searchQuery = '';
    this.filterReimburse();
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
    return Math.ceil(this.Reimburse.length / this.pageSize);
  }

  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedReimburse = this.Reimburse.slice(startIndex, endIndex);
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

  loadReimburseListFromAPI() {
    this.isLoading = true;
    const userId: any = Number(sessionStorage.getItem('userId'));
    const payload: any = { user_Pk_Id: userId };

    this.dbService.GetReimburse(payload).subscribe(
      (data: any[]) => {
        if (data && data.length > 0) {
          this.Reimburse = data.map((ts: any): ReimburseList => ({
            id: ts.pk_Reimburse_Id,
            EmpId: ts.user_Pk_Id || 'N/A',
            Client: ts.client_Description || 'N/A',
            Project: ts.project_Name || 'N/A',
            Date: this.formatDate(ts.date),
            ClaimAmount: ts.claim_Amount || 'N/A',
            Expense: ts.expense_Description || 'N/A',
            Approver: ts.approved_By || '',
            Remarks: ts.remarks || 'N/A',
            Status: ts.status_Description || 'Pending',
            rawDate: ts.date // ✅ raw format needed for API download
          }));

          this.Reimburse.sort((a, b) => b.id - a.id);
          this.filteredReimburse = [...this.Reimburse];
          this.currentPage = 1;
          this.updatePagination();
        } else {
          console.warn("No data received from API.");
        }
      },
      (error) => {
        console.error("Error fetching reimbursements:", error);
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  exportToExcel() {
    if (this.filteredReimburse.length === 0) {
      alert('No records available to export');
      return;
    }

    const exportData = this.filteredReimburse.map(({ id, rawDate, ...rest }) => rest);
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = { Sheets: { 'Reimburse': worksheet }, SheetNames: ['Reimburse'] };
    XLSX.writeFile(workbook, 'Reimburse.xlsx');
  }

  // ✅ File download method// ✅ File download method
downloadFile(empId: string, rawDate: string) {
  const dateObj = new Date(rawDate);
  const formattedDate = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')}`;

  const payload = {
    user_Pk_Id: empId,
    date: formattedDate
  };

  this.dbService.downloadReimburseStatus(payload).subscribe({
    next: (res: Blob) => {
      const blob = new Blob([res], { type: res.type });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reimburse_${empId}_${rawDate}`; // use .xlsx if file type is Excel
      a.click();
      window.URL.revokeObjectURL(url);
    },
    error: err => {
      console.error('Download failed', err);
      alert('Download failed. Please try again.');
    }
  });
}

}
