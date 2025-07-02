import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DbservicesService } from '../dbservices.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDateFormats } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';


@Component({
  selector: 'app-addformcreate',
  standalone: true,
  templateUrl: './addformcreate.component.html',
  styleUrls: ['./addformcreate.component.scss'],
  
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatInputModule, MatDatepickerModule, MatNativeDateModule, MatFormFieldModule,MatTooltipModule],
  providers: [DatePipe]
})


export class AddformcreateComponent implements OnInit, OnDestroy {
  timesheetForm!: FormGroup;
  weekNumber: number | null = null;
  clients: any[] = [];
  projects: any[][] = [];
  Activity: any[] = [];

  currentWeekStart!: Date;
  currentWeekEnd!: Date;
  lastWeekStart!: Date;
  lastWeekEnd!: Date;

  selectedCopyRowIndex: number | null = null;
  copiedRowData: any = null;
  selectedCheckboxIndexes: Set<number> = new Set();
  pastedRowIndexes: Set<number> = new Set();

  canLoadPreviousWeek = false;
  isViewingPreviousWeek = false;

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe,
    private dbService: DbservicesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.timesheetForm = this.fb.group({
      timesheet_Details: this.fb.array([])
    });

    this.setWeekBoundaries();
    this.loadDropdowns();
    this.loadCurrentWeek();
    this.setWeekBoundaries();
this.checkPreviousWeekCompletion();
this.checkPreviousWeekEligibility();


 // Load current week by default

    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('click', this.clearPasteHighlights);
  }

  ngOnDestroy(): void {
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    document.removeEventListener('click', this.clearPasteHighlights);
  }

  get timesheetEntries(): FormArray {
    return this.timesheetForm.get('timesheet_Details') as FormArray;
  }
isRowDisabled(entry: FormGroup): boolean {
  const status = entry.get('status')?.value?.toLowerCase();
  return status === 'approved' || status === 'pending';
}

setWeekBoundaries(): void {
  const today = new Date();
  const day = today.getDay();

  if (day === 0) {
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - 6);
    const lastSaturday = new Date(lastMonday);
    lastSaturday.setDate(lastMonday.getDate() + 5);

    this.currentWeekStart = lastMonday;
    this.currentWeekEnd = lastSaturday;
  } else {
    const monday = new Date(today);
    const offset = 1 - day;
    monday.setDate(today.getDate() + offset);
    const saturday = new Date(monday);
    saturday.setDate(monday.getDate() + 5);

    this.currentWeekStart = monday;
    this.currentWeekEnd = saturday;
  }


  // ✅ Enable "Previous" button on **Sunday (0)** and **Monday (1)**
  this.canLoadPreviousWeek = day === 0 || day === 1;

  // Setup lastWeek boundaries
  this.lastWeekStart = new Date(this.currentWeekStart);
  this.lastWeekStart.setDate(this.currentWeekStart.getDate() - 7);
  this.lastWeekEnd = new Date(this.lastWeekStart);
  this.lastWeekEnd.setDate(this.lastWeekStart.getDate() + 5);
}
checkPreviousWeekCompletion(): void {
  const today = new Date();
  const isMonday = today.getDay() === 1; // 1 = Monday

  if (!isMonday) {
    return; // Exit without showing popup if NOT Monday
  }

  const employeeID = sessionStorage.getItem('userId') || this.dbService.getUserId() || '';

  const fromDateStr = this.datePipe.transform(this.lastWeekStart, 'yyyy-MM-dd')!;
  const toDateStr = this.datePipe.transform(this.lastWeekEnd, 'yyyy-MM-dd')!;

  const payload = { employeeID, fromdate: fromDateStr, todate: toDateStr };

  this.dbService.GetTimesheets(payload).subscribe(res => {
    const submittedDays = new Set(res.map((row: any) => row.date));
    const totalWeekdays = [];

    const current = new Date(this.lastWeekStart);
    while (current <= this.lastWeekEnd) {
      const day = current.getDay();
      if (day >= 1 && day <= 6) {
        totalWeekdays.push(this.datePipe.transform(current, 'yyyy-MM-dd')!);
      }
      current.setDate(current.getDate() + 1);
    }

    const missingDays = totalWeekdays.filter(date => !submittedDays.has(date));

    // if (missingDays.length > 0) {
    //   Swal.fire({
    //     icon: 'warning',
    //     text: `Previous week timesheet is incomplete. Please submit remaining days.`,
    //   });
    // }
  });
}



loadCurrentWeek(): void {
  this.isViewingPreviousWeek = false;
  this.weekNumber = this.calculateWeekNumber(this.currentWeekStart);
  this.generateRows(this.currentWeekStart, this.currentWeekEnd);

  // 🔥 Recheck eligibility after switching back to current week
  this.checkPreviousWeekEligibility();
}



checkPreviousWeekEligibility(): void {
  const today = new Date();
  const isMonday = today.getDay() === 1; // 1 = Monday

  if (!isMonday) {
    // ❌ Not Monday – disable previous button always
    this.canLoadPreviousWeek = false;
    return;
  }

  // ✅ Only if Monday, check backend for eligibility
  const employeeID = sessionStorage.getItem('userId') || this.dbService.getUserId() || '';
  const payload = { employeeID };

  this.dbService.getpreviousweek(payload).subscribe(res => {
    const data = res[0];
    // ✅ Enable button only if eligibility = 'eligible'
    this.canLoadPreviousWeek = data.eligibility?.toLowerCase() === 'eligible';
  });
}


datechange(i: number) {
    const val: any = this.timesheetEntries.controls[i];
    const formatDate: any = this.datePipe.transform(new Date(val.controls.date.value), 'yyyy-MM-dd');
    val.controls.date.setValue(formatDate);
  }
myFilter = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    return day !== 0;
  };


loadPreviousWeek(): void {
  const today = new Date();
  const isMonday = today.getDay() === 1;

  const employeeID = sessionStorage.getItem('userId') || this.dbService.getUserId() || '';
  const payload = { employeeID };

  this.dbService.getpreviousweek(payload).subscribe(res => {
    const data = res[0];
    
    if (data.eligibility === 'eligible' || isMonday) {
      this.isViewingPreviousWeek = true;
      this.weekNumber = this.calculateWeekNumber(this.lastWeekStart);
      this.generateRows(this.lastWeekStart, this.lastWeekEnd);
        this.canLoadPreviousWeek = false;
       
    } else {
      Swal.fire('Not Allowed', 'You are not eligible to view previous week.', 'warning');
    }
  });
}



  calculateWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((+d - +yearStart) / 86400000) + 1) / 7);
  }

  generateRows(from: Date, to: Date): void {
  this.timesheetEntries.clear();
  const employeeID = sessionStorage.getItem('userId') || this.dbService.getUserId() || '';

  const fromDateStr = this.datePipe.transform(from, 'yyyy-MM-dd')!;
  const toDateStr = this.datePipe.transform(to, 'yyyy-MM-dd')!;

  const payload = { employeeID, fromdate: fromDateStr, todate: toDateStr };

  this.dbService.GetTimesheets(payload).subscribe(async (submitted: any[]) => {
    const submittedMap = new Map<string, any>();

    // 🔷 Map submitted entries by date for quick lookup
    for (const entry of submitted) {
      const dateStr = this.datePipe.transform(entry.date, 'yyyy-MM-dd')!;
      submittedMap.set(dateStr, entry);
    }

    const current = new Date(from);
    let index = 0;

    while (current <= to) {
      const day = current.getDay(); // 0=Sunday, 6=Saturday
      const dateStr = this.datePipe.transform(current, 'yyyy-MM-dd')!;

      if (day >= 1 && day <= 6) { // ✅ Monday to Saturday only
        const existing = submittedMap.get(dateStr);
        const row = this.createTimesheetEntry(dateStr);
        this.timesheetEntries.push(row);

        if (existing) {
          row.patchValue({
            pk_Timesheet_Details_Id: existing.pk_Timesheet_Details_Id,
            client_Pk_Id: existing.client_Pk_Id,
            dep_Pk_Id: existing.project_Pk_Id,
            date: dateStr,
            work_Pk_Id: existing.work_Pk_Id,
            work_Hour: existing.work_Hour,
            remarks: existing.remarks,
            approved_By: existing.approved_By || null,
            status: existing.status || ''
          });

          const status = (existing.status || '').trim().toLowerCase();
          if (status === 'approved' || status === 'rejected' || status === 'pending') {
            row.disable(); // 🔥 disables if status is approved/rejected/pending
          } else {
            row.enable();
          }

          // 🔷 Load project dropdown if existing client id present
          try {
            const res = await this.dbService.GetProjectMaster({ client_Pk_Id: existing.client_Pk_Id }).toPromise();
            this.projects[index] = res;
          } catch (err) {
            console.error('Error loading projects:', err);
          }
        }

        index++;
      }

      current.setDate(current.getDate() + 1);
    }

    this.cdr.detectChanges();
  });
}

createTimesheetEntry(date: string | null): FormGroup {
  return this.fb.group({
    pk_Timesheet_Details_Id: [null],
    client_Pk_Id: ['', Validators.required],
    dep_Pk_Id: ['', Validators.required],
    date: [date, Validators.required],  // keep Validators if required
    work_Pk_Id: ['', Validators.required],
    work_Hour: [0, [Validators.required, Validators.min(0)]],
    remarks: ['', Validators.required],
    approved_By: [null],
    status: ['']
  });
}


clearRow(index: number): void {
  const entry = this.timesheetEntries.at(index);

  entry.patchValue({
    client_Pk_Id: '',
    dep_Pk_Id: '',
    work_Pk_Id: '',
    work_Hour: 0,
    remarks: ''
  });

  this.projects[index] = []; // Clear project dropdown
  this.cdr.detectChanges();
}
deleteRow1(index: number): void {
  const entry = this.timesheetEntries.at(index);
  const timesheetId = entry.get('pk_Timesheet_Details_Id')?.value;

  Swal.fire({
    text: 'Are you sure you want to delete this timesheet?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes',
    cancelButtonText: 'No',
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
      if (timesheetId) {
        // 🔥 Existing row - call API to delete from DB
        this.dbService.GetDeleteTimesheet(timesheetId).subscribe(
          (response) => {
            Swal.fire('Deleted!', 'Timesheet deleted successfully.', 'success');

            // ✅ Remove from form array and projects array
            this.timesheetEntries.removeAt(index);
            this.projects.splice(index, 1);

            this.cdr.detectChanges();
          },
          (error) => {
            console.error('Error deleting timesheet:', error);
            Swal.fire('Error', 'Failed to delete timesheet. Please try again.', 'error');
          }
        );
      } else {
        // 🔥 New unsaved row - no API call needed
        this.timesheetEntries.removeAt(index);
        this.projects.splice(index, 1);
        this.cdr.detectChanges();
      }
    }
  });
}

deleteRow(index: number): void {
  const entry = this.timesheetEntries.at(index);
  const timesheetId = entry.get('pk_Timesheet_Details_Id')?.value;
  const deletedDate = entry.get('date')?.value;

  Swal.fire({
    text: 'Are you sure you want to reset this timesheet?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes,',
    cancelButtonText: 'No',
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
      if (timesheetId) {
        // 🔥 Existing row - call API to delete
        this.dbService.GetDeleteTimesheet(timesheetId).subscribe(
          (response) => {
            Swal.fire('Deleted!', 'Timesheet deleted successfully.', 'success');

            // ✅ Remove from form
            this.timesheetEntries.removeAt(index);
            this.projects.splice(index, 1);

            // ✅ Add fresh empty row for same date
            const newRow = this.createTimesheetEntry(deletedDate);
            this.timesheetEntries.insert(index, newRow);
            this.projects.splice(index, 0, []);

            this.cdr.detectChanges();
          },
          (error) => {
            console.error('Error deleting timesheet:', error);
            Swal.fire('Error', 'Failed to delete timesheet. Please try again.', 'error');
          }
        );
      } else {
        // 🔥 New unsaved row - no API call needed
        this.timesheetEntries.removeAt(index);
        this.projects.splice(index, 1);

        // ✅ Add fresh empty row for same date
        const newRow = this.createTimesheetEntry(deletedDate);
        this.timesheetEntries.insert(index, newRow);
        this.projects.splice(index, 0, []);

        this.cdr.detectChanges();
      }
    }
  });
}


 addRow() {
  // ⛔ Don't assign today's date
  this.timesheetEntries.push(this.createTimesheetEntry(null));
  this.cdr.detectChanges();
}


  Fetch_Project(i: number): void {
    const clientId = this.timesheetEntries.at(i).value.client_Pk_Id;
    if (!clientId) return;
    this.dbService.GetProjectMaster({ client_Pk_Id: clientId }).subscribe(res => {
      this.projects[i] = res;
    });
  }

  toggleRowSelection(index: number): void {
    this.selectedCheckboxIndexes.has(index)
      ? this.selectedCheckboxIndexes.delete(index)
      : this.selectedCheckboxIndexes.add(index);
  }

  wasRowPasted(index: number): boolean {
    return this.pastedRowIndexes.has(index);
  }

  clearPasteHighlights = (event: MouseEvent): void => {
    const target = event.target as HTMLElement;
    if (target.closest('.serial-col')) return;
    if (this.pastedRowIndexes.size > 0) {
      this.pastedRowIndexes.clear();
      this.cdr.detectChanges();
    }
  };

  handleKeyDown(event: KeyboardEvent): void {
    if (event.ctrlKey && event.key.toLowerCase() === 'c') {
      const selected = Array.from(this.selectedCheckboxIndexes);
      if (selected.length === 1) {
        const index = selected[0];
        this.selectedCopyRowIndex = index;
        this.copiedRowData = {
          client_Pk_Id: this.timesheetEntries.at(index).value.client_Pk_Id,
          dep_Pk_Id: this.timesheetEntries.at(index).value.dep_Pk_Id,
          work_Pk_Id: this.timesheetEntries.at(index).value.work_Pk_Id,
          work_Hour: this.timesheetEntries.at(index).value.work_Hour,
          remarks: this.timesheetEntries.at(index).value.remarks
        };
        Swal.fire('Copied', `Row ${index + 1} copied. Use Ctrl+V to paste.`, 'success');
      } else {
        Swal.fire('Copy Error', 'Please select exactly one row to copy (Ctrl+C).', 'warning');
      }
    }

    if (event.ctrlKey && event.key.toLowerCase() === 'v') {
      if (this.selectedCopyRowIndex === null || !this.copiedRowData) return;

      let anyPasted = false;
      this.pastedRowIndexes.clear();

      this.timesheetEntries.controls.forEach((entry, i) => {
        if (this.selectedCheckboxIndexes.has(i) && i !== this.selectedCopyRowIndex && !entry.disabled) {
          entry.patchValue({ ...this.copiedRowData });
          this.Fetch_Project(i);
          this.pastedRowIndexes.add(i);
          anyPasted = true;
        }
      });

      if (!anyPasted) {
        Swal.fire('Nothing to Paste', 'No rows selected to paste into.', 'info');
      }

      this.cdr.detectChanges();
      setTimeout(() => {
        this.pastedRowIndexes.clear();
        
    this.selectedCheckboxIndexes.clear();
        this.cdr.detectChanges();
      }, 500);
    }
  }

onSubmit(): void {
  if (this.timesheetForm.invalid) {
    Swal.fire('Validation Error', 'Please fill all fields', 'warning');
    return;
  }

  const submittedRows: any[] = [];
  const rawEntries = this.timesheetEntries.controls;

  const dailyHoursMap: { [date: string]: number } = {};
  const projectDateSet = new Set<string>();

  // STEP 1: Process rows
  rawEntries.forEach((group, index) => {
  const isDisabled = group.disabled;
  const entry = group.getRawValue();
  const date = entry.date;
  const hours = Number(entry.work_Hour || 0);
  const status = (entry.status || '').toLowerCase();

  // 🔄 Collect total hours (ALL rows: enabled + disabled)
  dailyHoursMap[date] = (dailyHoursMap[date] || 0) + hours;

  if (!isDisabled && status !== 'pending') {
    if (entry.client_Pk_Id && entry.dep_Pk_Id && entry.work_Pk_Id) {
      submittedRows.push({
        ...entry,
        approved_By: '300044'
      });

      const key = `${entry.dep_Pk_Id}_${date}`;
      if (projectDateSet.has(key)) {
        Swal.fire('Duplicate Entry', `Duplicate project entry on ${date}`, 'warning');
        return;
      }
      projectDateSet.add(key);
    }
  }
});


  // STEP 2: Validate daily hours (ALL rows)
  for (const [date, totalHours] of Object.entries(dailyHoursMap)) {
    if (totalHours > 10) {
      Swal.fire('Error', `Work hours cannot exceed 10 on ${date}`, 'error');
      return;
    }
  }

  // STEP 3: If no valid submitted rows, stop
  if (submittedRows.length === 0) {
    Swal.fire('No Data', 'Please fill at least one row before submitting.', 'warning');
    return;
  }

  // STEP 4: Project-level allocation validation
  const employeeID = sessionStorage.getItem('userId') || this.dbService.getUserId() || '';
  const projectHoursMap: { [projectId: number]: number } = {};

  for (const entry of submittedRows) {
    const projectId = entry.dep_Pk_Id;
    projectHoursMap[projectId] = (projectHoursMap[projectId] || 0) + Number(entry.work_Hour);
  }

  const validations = Object.entries(projectHoursMap).map(([projectId, hours]) =>
    this.dbService.GetProjectAllocated({ employeeID, projectID: +projectId }).toPromise().then(res => {
      const data = res[0];
      if (!data) return;
      const { allocatedHours, usedHours, remainingHours, projectName, clientName } = data;
      if (remainingHours <= 0) {
        throw new Error(`No hours remaining for ${projectName} (${clientName})`);
      }
      if (usedHours + hours > allocatedHours) {
        throw new Error(`${projectName} limit exceeded. Used: ${usedHours}, Adding: ${hours}, Allocated: ${allocatedHours}`);
      }
    })
  );

  // STEP 5: Submit after validation
  Promise.all(validations)
    .then(() => {
      const payload = { timesheet_Details: submittedRows };

      this.dbService.GetInsertTimeSheet(payload).subscribe({
        next: (res) => {
          if (res[0]?.statuscode === 200) {
            Swal.fire('Success', res[0].description, 'success').then(() => {
              window.location.reload();
            });
          } else {
            Swal.fire('Error', res[0].description || 'Submission failed.', 'error');
          }
        },
        error: (err) => {
          console.error('Submission Error:', err.error?.errors || err);
          Swal.fire('Backend Error', 'Validation failed. See console.', 'error');
        }
      });
    })
    .catch(err => {
      Swal.fire('Validation Error', err.message || 'Allocation validation failed', 'warning');
    });
}






  private loadDropdowns(): void {
    this.dbService.getClientMaster({}).subscribe(data => this.clients = data);
    this.dbService.GetWorkCategory({}).subscribe(data => this.Activity = data);
  }
}
