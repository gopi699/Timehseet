import { Component, ChangeDetectorRef, OnInit, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { DbservicesService } from '../dbservices.service';
import { EncryptionService } from '../login/login.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Injectable({
  providedIn: 'root'
})
export class TimesheetService {
  private submittedTimesheets: any[] = [];

  getSubmittedTimesheets() {
    return this.submittedTimesheets;
  }

  setSubmittedTimesheets(timesheets: any[]) {
    this.submittedTimesheets = timesheets;
  }

  removeTimesheet(index: number) {
    if (index >= 0 && index < this.submittedTimesheets.length) {
      this.submittedTimesheets.splice(index, 1);
    }
  }
}

@Component({
  selector: 'app-addformcreate',
  standalone: true,
  templateUrl: './addformcreate.component.html',
  styleUrls: ['./addformcreate.component.scss'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatInputModule, MatDatepickerModule, MatNativeDateModule, MatFormFieldModule],
  providers: [DatePipe]
})
export class AddformcreateComponent implements OnInit {
  [x: string]: any;
  timesheetForm!: FormGroup;

  user_Id: string | null = null;
  userProperties: any;
  clients: any[] = [];
  projects: any[] = [];
  Activity: any[] = [];
  Approver: any[] = [];
  submitted = false;
  myDate: Date = new Date();

  constructor(
    private dbService: DbservicesService,
    private fb: FormBuilder,
    private encryptionService: EncryptionService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    this.timesheetForm = this.fb.group({
      timesheet_Details: this.fb.array([this.createTimesheetEntry()])
    });

    this.fetchData();
  }

  myFilter = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    return day !== 0;
  };

  createTimesheetEntry(): FormGroup {
    return this.fb.group({
      client_Pk_Id: ['', Validators.required],
      dep_Pk_Id: ['', Validators.required],
      date: ['', Validators.required],
      work_Pk_Id: ['', Validators.required],
      work_Hour: [0, [Validators.required]],
      approved_By: ['', Validators.required],
      remarks: ['', Validators.required]
    });
  }

  get timesheetEntries(): FormArray {
    return this.timesheetForm.get('timesheet_Details') as FormArray;
  }

  Fetch_Project(i: number) {
    const val: any = this.timesheetEntries.controls[i];
    const rawVal: any = val.getRawValue();

    if (!rawVal.client_Pk_Id) return;

    this.dbService.GetProjectMaster({ client_Pk_Id: rawVal.client_Pk_Id }).subscribe(
      (response: any) => {
        this.projects[i] = response;
      },
      (error: any) => {
        console.error('Failed to fetch projects', error);
      }
    );
  }

  addRow() {
    this.timesheetEntries.push(this.createTimesheetEntry());
    this.cdr.detectChanges();
  }

  deleteRow(index: number): void {
    this.timesheetEntries.removeAt(index);
    this.cdr.detectChanges();
  }

  datechange(i: number) {
    const val: any = this.timesheetEntries.controls[i];
    const formatDate: any = this.datePipe.transform(new Date(val.controls.date.value), 'yyyy-MM-dd');
    val.controls.date.setValue(formatDate);
  }

  onSubmit() {
    this.submitted = true;
    const formData: any = this.timesheetForm.getRawValue();

    if (!this.timesheetForm.valid) {
      Swal.fire({
        text: 'Please fill in all required fields correctly!',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    const employeeID = sessionStorage.getItem('userId') || this.dbService.getUserId() || '';

    const dailyProjectHoursMap: { [key: string]: number } = {};
    formData.timesheet_Details.forEach((entry: any) => {
      const key = `${entry.dep_Pk_Id}_${entry.date}`;
      dailyProjectHoursMap[key] = (dailyProjectHoursMap[key] || 0) + Number(entry.work_Hour);
    });

    for (const [key, totalHours] of Object.entries(dailyProjectHoursMap)) {
      if (totalHours > 10) {
        const [projId, date] = key.split('_');
        Swal.fire({
          title: 'Exceeded Daily Hours',
          text: `You have entered ${totalHours} hours for project ID ${projId} on ${date}, which exceeds the daily limit of 10 hours.`,
          icon: 'warning',
          confirmButtonText: 'OK'
        });
        return;
      }
    }

    const projectDateSet = new Set<string>();
    for (const entry of formData.timesheet_Details) {
      const key = `${entry.dep_Pk_Id}_${entry.date}`;
      if (projectDateSet.has(key)) {
        Swal.fire({
          title: 'Duplicate Entry',
          text: `Duplicate entry found for project ID ${entry.dep_Pk_Id} on ${entry.date}.`,
          icon: 'warning',
          confirmButtonText: 'OK'
        });
        return;
      }
      projectDateSet.add(key);
    }

    const projectHoursMap: { [projectId: number]: number } = {};
    formData.timesheet_Details.forEach((entry: any) => {
      projectHoursMap[entry.dep_Pk_Id] = (projectHoursMap[entry.dep_Pk_Id] || 0) + Number(entry.work_Hour);
    });

    const validationChecks = Object.keys(projectHoursMap).map(projectIdStr => {
      const projectId = Number(projectIdStr);
      return this.dbService.GetProjectAllocated({ employeeID, projectID: projectId }).toPromise().then((response: any) => {
        const allocated = response[0]?.allocatedHours ?? 0;
        const used = response[0]?.usedHours ?? 0;
        const remaining = response[0]?.remainingHours ?? 0;
        const newEntryHours = projectHoursMap[projectId];
        const projectName = response[0]?.projectName ?? `Project ID ${projectId}`;
        const clientName = response[0]?.clientName ?? 'Unknown Client';

        if (response[0] == null || Object.keys(response[0]).length === 0) return; // ✅ allow submit if API not sending data

        if (remaining <= 0) {
          throw new Error(`Timesheet not allowed. All allocated hours for Project: ${projectName} (Client: ${clientName}) are used.`);
        }

        if (used + newEntryHours > allocated) {
          throw new Error(`Project: ${projectName} – Used: ${used}, Trying to Add: ${newEntryHours}, Allocated: ${allocated}.`);
        }
      });
    });

    Promise.all(validationChecks)
      .then(() => {
        this.dbService.GetInsertTimeSheet(formData).subscribe(
          res => {
            if (res[0].statuscode === 200) {
              Swal.fire({
                text: res[0].description,
                icon: 'success',
                confirmButtonText: 'OK'
              }).then(() => {
                this.timesheetForm.reset();
                this.timesheetEntries.clear();
                this.timesheetEntries.push(this.createTimesheetEntry());
                this.cdr.detectChanges();
                this.router.navigate(['layout/view']);
              });
            } else {
              Swal.fire({ text: res[0].description, icon: 'error' });
            }
          },
          err => {
            Swal.fire({
              title: 'Error!',
              text: err?.error?.message || 'Failed to submit the form.',
              icon: 'error'
            });
          }
        );
      })
      .catch(err => {
        Swal.fire({
          title: 'Validation Error',
          text: err.message || 'Something went wrong during validation.',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
      });
  }

  navigateToView() {
    this.router.navigate(['layout/view']);
  }

  private fetchData() {
    this.dbService.getClientMaster({}).subscribe(
      (response: any) => {
        this.clients = response;
      },
      (error: any) => {
        console.error('Failed to fetch clients', error);
      }
    );

    this.dbService.GetWorkCategory({}).subscribe(
      (response: any) => {
        this.Activity = response;
      },
      (error: any) => {
        console.error('Failed to fetch activities', error);
      }
    );

    this.dbService.GetApproverList({}).subscribe(
      (response: any) => {
        this.Approver = response;
      },
      (error: any) => {
        console.error('Failed to fetch approvers', error);
      }
    );
  }
}