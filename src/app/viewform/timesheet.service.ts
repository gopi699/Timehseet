import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimesheetService {
  private submittedTimesheets: any[] = [];

  getSubmittedTimesheets() {
    return this.submittedTimesheets;
  }

  setSubmittedTimesheets(timesheets: any[]) {  // ✅ Fix: Add this method
    this.submittedTimesheets = timesheets;
  }

  addTimesheet(timesheet: any) {
    if (!timesheet.status) {   // ✅ Ensure status is set to "Pending" by default
      timesheet.status = "Pending";
    }
    this.submittedTimesheets.push(timesheet);
  }

  removeTimesheet(index: number) {
    if (index >= 0 && index < this.submittedTimesheets.length) {
      this.submittedTimesheets.splice(index, 1);
    }
  }
}
