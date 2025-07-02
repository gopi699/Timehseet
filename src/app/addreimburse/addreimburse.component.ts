import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { DbservicesService } from '../dbservices.service';
import { EncryptionService } from '../login/login.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-addreimburse',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './addreimburse.component.html',
  styleUrl: './addreimburse.component.css',
})
export class AddreimburseComponent implements OnInit {
  reimburse!: FormGroup;
  user_Id: string | null = null;
  userProperties: any;
  clients: any[] = [];
  projects: any[] = [];
  Expense: any[] = [];
  Approver: any[] = [];
  submitted = false;
  selectedFile: File[] = [];

  // Modal-related properties
  showOthersModal = false;
  showLocalConveyanceModal = false;
  othersRemarks = '';
  selectedConveyance = '';
  currentRowIndex: number | null = null;

  constructor(
    private dbService: DbservicesService,
    private fb: FormBuilder,
    private encryptionService: EncryptionService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.reimburse = this.fb.group({
      reimburse_Details: this.fb.array([this.createreimburseEntry()]),
    });
    this.fetchData();
  }

  createreimburseEntry(): FormGroup {
    return this.fb.group({
      client_Pk_Id: ['', Validators.required],
      dep_Pk_Id: ['', Validators.required],
      date: ['', Validators.required],
      claim_Amount: [0, Validators.required],
      expense_Pk_Id: ['', Validators.required],
      kms: [0],
      approver: ['', Validators.required],
      remarks: ['', Validators.required],
      files: [''],
    });
  }

  get reimburseEntries(): FormArray {
    return this.reimburse.get('reimburse_Details') as FormArray;
  }

  onFileSelected(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile[index] = input.files[0];
    }
  }

  Fetch_Project(i: number) {
    const val: any = this.reimburseEntries.controls[i];
    const rawVal: any = val.getRawValue();
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
    this.reimburseEntries.push(this.createreimburseEntry());
    this.cdr.detectChanges();
  }

  deleteRow(index: number): void {
    this.reimburseEntries.removeAt(index);
    this.cdr.detectChanges();
  }

onExpenseChange(expenseId: string, index: number) {
  const selectedExpense = this.Expense.find(e => String(e.id) === String(expenseId));
  if (selectedExpense) {
    const desc = selectedExpense.description.toLowerCase().trim();
    console.log('Selected Expense:', desc);

    if (desc.includes('other')) {
      this.showOthersModal = true;
      this.currentRowIndex = index;
    } else if (desc.includes('local conveyance')) {
      this.showLocalConveyanceModal = true;
      this.currentRowIndex = index;
    }
  }
}


  saveOthersRemarks() {
    if (this.currentRowIndex !== null) {
      this.reimburseEntries.at(this.currentRowIndex).patchValue({
        remarks: this.othersRemarks,
      });
    }
    this.othersRemarks = '';
    this.showOthersModal = false;
    this.currentRowIndex = null;
  }

 cancelOthersRemarks() {
  if (this.currentRowIndex !== null) {
    this.reimburseEntries.at(this.currentRowIndex).patchValue({
      expense_Pk_Id: ''
    });
  }
  this.othersRemarks = '';
  this.showOthersModal = false;
  this.currentRowIndex = null;
}

  saveLocalConveyance() {
    if (this.currentRowIndex !== null) {
      this.reimburseEntries.at(this.currentRowIndex).patchValue({
        remarks: this.selectedConveyance,
      });
    }
    this.selectedConveyance = '';
    this.showLocalConveyanceModal = false;
    this.currentRowIndex = null;
  }

  cancelLocalConveyance() {
  if (this.currentRowIndex !== null) {
    this.reimburseEntries.at(this.currentRowIndex).patchValue({
      expense_Pk_Id: ''
    });
  }
  this.selectedConveyance = '';
  this.showLocalConveyanceModal = false;
  this.currentRowIndex = null;
}

  onSubmit() {
    this.submitted = true;
    const formValues = this.reimburse.getRawValue();

    if (this.reimburse.valid) {
      const payload = { ...formValues };

      this.dbService.InsertReimburse(payload).subscribe(
        (response) => {
          if (response[0].statuscode === 200) {
            const uploadData = new FormData();
            let filesExist = false;

            formValues?.reimburse_Details?.forEach((detail: any, index: number) => {
              const dateValue = detail.date;
              const fileControl = this.selectedFile?.[index];

              if (fileControl && fileControl instanceof File) {
                const fileName = fileControl.name;
                uploadData.append('files', fileControl, fileName);
                filesExist = true;
              }
              uploadData.append('date', dateValue);
            });

            if (filesExist) {
              this.dbService.InsertReimburseUpload(uploadData).subscribe(
                (uploadResponse) => {
                  this.handleSuccess(response[0].description);
                },
                (uploadError) => {
                  console.error('File Upload Error:', uploadError);
                  Swal.fire({
                    title: 'Error!',
                    text: 'Failed to upload the files. Please try again.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                  });
                }
              );
            } else {
              this.handleSuccess(response[0].description);
            }
          } else {
            Swal.fire({
              text: response[0].description,
              icon: 'error',
              showConfirmButton: true,
              confirmButtonText: 'OK',
              title: '',
            });
          }
        },
        (error) => {
          console.error('Error:', error);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to submit the form. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }
      );
    } else {
      Swal.fire({
        text: 'Please fill in all required fields correctly!',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
    }
  }

  handleSuccess(description: string) {
    Swal.fire({
      text: description,
      icon: 'success',
      confirmButtonText: 'OK',
    }).then(() => {
      this.reimburse.reset();
      this.reimburseEntries.clear();
      this.reimburseEntries.push(this.createreimburseEntry());
      this.cdr.detectChanges();
      this.router.navigate(['layout/viewreimburse']);
    });
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

    this.dbService.getExpenseMaster({}).subscribe(
      (response: any) => {
        this.Expense = response;
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
