import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DbservicesService } from '../dbservices.service';
import { TimesheetService } from './timesheet.service';
import * as XLSX from 'xlsx';
import { FormsModule } from '@angular/forms';
import { saveAs } from 'file-saver';
import { filter } from 'rxjs/operators';
import Swal from 'sweetalert2';

// ✅ Timesheet Interface
interface Timesheet {
  id: number;
  UserId : string;
  Client: string;
  Project: string;
  Date: string;
  Activity: string;
  WorkHour: string;
  Approver: string;
  Remarks: string;
  Status: string;
}

@Component({
  selector: 'app-viewform',
  standalone: true,
  templateUrl: './viewform.component.html',
  styleUrls: ['./viewform.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class ViewformComponent implements OnInit {
  searchQuery: string = '';
  timesheets: Timesheet[] = [];
  filteredTimesheets: Timesheet[] = [];
  paginatedTimesheets: Timesheet[] = [];
  isLoading: boolean = false;
  currentPage: number = 1;
  pageSize: number = 10;

  constructor(
    private dbService: DbservicesService,
    private timesheetService: TimesheetService,
    private router: Router
  ) {
    // ✅ Listen for route changes & reload data
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd && event.url.includes('/view')))
      .subscribe(() => {
        //console.log("Reloading timesheets due to navigation change...");
        this.loadTimesheetsFromAPI();
      });
  }

  ngOnInit() {
    //console.log("Initializing ViewformComponent...");
    this.loadTimesheetsFromAPI();
  }

  get totalPages(): number {
    return Math.ceil(this.filteredTimesheets.length / this.pageSize);
  }

  // ✅ Fetch timesheets from API
  loadTimesheetsFromAPI() {
    this.isLoading = true;
    const userId: any = Number(sessionStorage.getItem('userId'));
    const payload: any = { user_Pk_Id: userId };
  
    this.dbService.GetTimesheets(payload).subscribe(
      (data: any[]) => {
        //console.log("API Response:", data);
  
        if (data && data.length > 0) {
          this.timesheets = data.map((ts: any): Timesheet => ({
            id: ts.pk_Timesheet_Details_Id,
            UserId:ts.user_Pk_Id || 'N/A',
            Client: ts.client_Description || 'N/A',
            Project: ts.project_Name || 'N/A',
            Date: this.formatDate(ts.date),
            Activity: ts.work_Description || 'N/A',
            WorkHour: ts.work_Hour ? ts.work_Hour.toString() : '0',
            Approver: ts.approved_By || 'N/A',
            Remarks: ts.remarks || '',
            Status: ts.status || 'Pending'
          }));
  
          // ✅ Ensure newly added timesheets appear first
          this.timesheets.sort((a, b) => b.id - a.id);  // Sort by ID (assuming higher ID means newer record)
  
          this.filteredTimesheets = [...this.timesheets];
  
          // ✅ Always show the latest data on the first page
          this.currentPage = 1;
          this.updatePagination();
          this.timesheetService.setSubmittedTimesheets(this.timesheets);
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
  
  // ✅ Search & filter timesheets
  filterTimesheets() {
    this.filteredTimesheets = this.timesheets.filter(entry =>
      Object.values(entry).some(value =>
        value.toString().toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    );
    this.currentPage = 1;
    this.updatePagination();
  }

  // ✅ Remove a timesheet
  removeTimesheet(index: number) {
    const timesheetId = this.paginatedTimesheets[index].id;
    if (!timesheetId) {
    console.error("Invalid timesheet ID");
    return;
    }
   
    Swal.fire({
    text: 'Are you sure you want to delete this timesheet?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'No, cancel!',
    reverseButtons: true
    }).then((result) => {
    if (result.isConfirmed) {
    this.dbService.GetDeleteTimesheet(timesheetId).subscribe(
    (response) => {
    //console.log("Timesheet deleted successfully:", response);
    this.timesheets = this.timesheets.filter(ts => ts.id !== timesheetId);
    this.filterTimesheets();
   
    
    },
    (error) => {
    console.error("Error deleting timesheet:", error);
    Swal.fire({
    text: 'Failed to delete timesheet. Please try again.',
    icon: 'error',
    confirmButtonText: 'OK'
    });
    }
    );
    }
    }).catch((error) => {
    console.error("Error with confirmation dialog:", error);
    });
    }
  // ✅ Format date as "DD-MMM-YYYY"
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

  // ✅ Pagination logic
  updatePagination() {
    // ✅ Correct slicing to maintain pagination order
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedTimesheets = this.filteredTimesheets.slice(startIndex, endIndex);
  }
  

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }
  clearSearch() {
    this.searchQuery = '';
    this.filterTimesheets(); // Reset filtered results
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
  // ✅ Navigate to Add Timesheet form
  navigateToAddForm() {
    this.router.navigate(['/addtimesheet']).then(() => console.log("Navigated to Add Timesheet"));
  }

  // ✅ Export to Excel
  exportToExcel() {
    if (this.filteredTimesheets.length === 0) {
      alert('No records available to export');
      return;
    }
  
    // ✅ Remove "id" field from each timesheet before export
    const exportData = this.filteredTimesheets.map(({ id, ...rest }) => rest);
  
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = { Sheets: { 'Timesheets': worksheet }, SheetNames: ['Timesheets'] };
    XLSX.writeFile(workbook, 'Timesheets.xlsx');
  }
  
}
