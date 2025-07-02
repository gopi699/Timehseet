import { Component, OnInit } from '@angular/core';
import { ElementRef, ViewChild } from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
  FormsModule,
  FormControl,
  AbstractControl
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DbservicesService } from '../dbservices.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-employee-master',
  standalone: true,
  templateUrl: './employee-master.component.html',
  styleUrls: ['./employee-master.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class EmployeeMasterComponent implements OnInit {
  [x: string]: any;
  activeTab = 1;
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  steps = [
    'Employee Master',
    'Personal Details',
    'Bank Details',
    'Education',
    'Previous Company'
  ];

  employeeMasterForm!: FormGroup;
  personalDetailsForm!: FormGroup;
  bankDetailsForm!: FormGroup;
  educationDetailsForm!: FormGroup;
  previousCompanyForm!: FormGroup;

    entityList: any[] = [];
    userList: any[] = [];

  buList: any[] = [];
  rolelist: any[] = [];
previousCompanyFiles: File[] = [];
roleId:any;
selectedRoleId: string = '';
selectedEmployeeId: string | null = null;

  constructor(private fb: FormBuilder, private service: DbservicesService) {}

  ngOnInit(): void {
    this.initForms();
      this.loadEntityList();
      this.loadUsers(); // ✅ add this
    this.loadBuList();
    this.loadrolelist();
    this.roleId = sessionStorage.getItem("roleId");
    if (this.roleId !== '1') {
      this.loadAllEmployeeData();
    }
    
  }
transformEducationRows(rows: any[]): any[] {
  const payload: any = {};

  for (const row of rows) {
    switch (row.level) {
      case 'SSLC':
        payload.sslC_School = row.institution;
        payload.sslC_StartDate = row.start;
        payload.sslC_EndDate = row.end;
        break;

      case 'HSC':
        payload.hsS_School = row.institution;
        payload.hsS_StartDate = row.start;
        payload.hsS_EndDate = row.end;
        break;

      case 'UG':
        payload.uG_Course = row.course;
        payload.uG_University = row.institution;
        payload.uG_StartDate = row.start;
        payload.uG_EndDate = row.end;
        break;

      case 'PG':
        payload.pG_Course = row.course;
        payload.pG_University = row.institution;
        payload.pG_StartDate = row.start;
        payload.pG_EndDate = row.end;
        break;

      case 'Certification':
        payload.certification_Course = row.course;
        payload.certification_University = row.institution;
        payload.certification_StartDate = row.start;
        payload.certification_EndDate = row.end;
        break;

      case 'Professional Course':
        payload.professional_Course = row.course;
        payload.professional_University = row.institution;
        payload.professional_StartDate = row.start;
        payload.professional_EndDate = row.end;
        break;
    }
  }

  return [payload]; // keep this array wrapping for API compatibility
}
  /* Duplicate onEmployeeChanged removed to resolve duplicate identifier error */
loadUsers() {
  this.service.Getrole({}).subscribe({
    next: (res) => {
      this.userList = res;
    },
    error: (err) => console.error('Error loading users:', err)
  });
}

  loadEntityList() {
    this.service.getEntityList({}).subscribe({
      next: (res) => this.entityList = res,
      error: (err) => console.error('Entity list error:', err)
    });
  }

  loadBuList() {
    this.service.getBuList({}).subscribe({
      next: (res) => this.buList = res,
      error: (err) => console.error('BU list error:', err)
    });
  }

  loadrolelist() {
  this.service.getrolelist({}).subscribe({
    next: (res) => {
      this.rolelist = res;
      console.log('Role list loaded:', res); // Optional: Debug
    },
    error: (err) => console.error('Role list error:', err)
  });
}


resetEducationGroup(groupName: string) {
  const group = this.educationDetailsForm.get(groupName) as FormGroup;
  group.reset();
}
  initForms() {
    this.employeeMasterForm = this.fb.group({
      // employee_Id: ['', Validators.required],
      employee_Name: ['', Validators.required],
      entity: [''],
      business_unit: [''],
      date_of_joining: [''],
      employe_roll: [''],
      designation: [''],
      email_Id_personal: [''],
      phone_number: [''],
      emergency_contact_number_1: ['']
    });

    this.personalDetailsForm = this.fb.group({
      file: [null, Validators.required], // ✅ Store File, not string
      date_of_Birth: ['', Validators.required],
      gender: ['', Validators.required],
      paN_No: ['', Validators.required],
      aadhaar_Card_Number: ['', Validators.required],
      marital_Status: ['', Validators.required],
      blood_Group: ['', Validators.required],
      fathers_Name: ['', Validators.required],
      mothers_Name: ['', Validators.required],
      spouse_Name: ['', Validators.required],
      number_of_kids: ['', Validators.required],
      permanent_Address: ['', Validators.required],
      emergency_Contact_Name_2: ['', Validators.required]
    });

    this.bankDetailsForm = this.fb.group({
      bankDetails: this.fb.array([this.createBankGroup()])
    });

 this.educationDetailsForm = this.fb.group({
  educationRows: this.fb.array([
    this.createEducationRow('SSLC'),
    this.createEducationRow('HSC'),
    this.createEducationRow('UG'),
    this.createEducationRow('PG'),
    this.createEducationRow('Certification'),
    this.createEducationRow('Professional Course')
  ])
});

    this.previousCompanyForm = this.fb.group({
      previousCompanyDetails: this.fb.array([this.createPreviousCompanyGroup()])
    });
  }

  // Form array getters
  get bankDetailsArray(): FormArray {
    return this.bankDetailsForm.get('bankDetails') as FormArray;
  }

  get certificationArray(): FormArray {
    return this.educationDetailsForm.get('certificationDetails') as FormArray;
  }

  get previousCompanyArray(): FormArray {
    return this.previousCompanyForm.get('previousCompanyDetails') as FormArray;
  }

  // Form group creators
  createBankGroup(): FormGroup {
    return this.fb.group({
      bank_Account_No: ['', Validators.required],
      ifsC_Code: ['', Validators.required],
      bank_Account_Type: ['', Validators.required],
      bank_Name: ['', Validators.required],
      bank_Branch: ['', Validators.required]
    });
  }

  createCertificationGroup(): FormGroup {
    return this.fb.group({
      cert_course: ['', Validators.required],
      cert_institution: ['', Validators.required],
      cert_start: ['', Validators.required],
      cert_end: ['', Validators.required]
    });
  }

loadAllEmployeeData() {
  // ✅ If Role ID == 1, use selected employee
  const userId = this.roleId === '1'
    ? this.selectedEmployeeId
 
    : sessionStorage.getItem('userId');

  if (!userId) {
    console.error('User ID not found.');
    return;
  }

  const payload = { employee_Id: userId };

  // ✅ Employee Master
  this.service.GetEmployeeById(payload).subscribe({
    next: (res) => {
      if (res && res.length > 0) {
        const data = res[0];
        if (data.date_of_joining) {
          data.date_of_joining = data.date_of_joining.substring(0, 10);
        }
        this.employeeMasterForm.patchValue(data);
      } else {
        this.employeeMasterForm.reset();
      }
    },
    error: (err) => console.error('GetEmployeeById Error:', err)
  });

  // ✅ Personal Details
  this.service.GetEmployeeProfById(payload).subscribe({
    next: (res) => {
      if (res && res.length > 0) {
        const data = res[0];
        if (data.date_of_Birth) {
          data.date_of_Birth = data.date_of_Birth.substring(0, 10);
        }
        this.personalDetailsForm.patchValue(data);
      } else {
        this.personalDetailsForm.reset();
      }
    },
    error: (err) => console.error('GetEmployeeProfById Error:', err)
  });

  // ✅ Bank Details
  this.service.GetEmployeeBankById(payload).subscribe({
    next: (res) => {
      this.bankDetailsArray.clear();
      if (res && res.length > 0) {
        res.forEach((bank: any) => {
          this.bankDetailsArray.push(this.fb.group({
            bank_Account_No: [bank.bank_Account_No, Validators.required],
            ifsC_Code: [bank.ifsC_Code, Validators.required],
            bank_Account_Type: [bank.bank_Account_Type, Validators.required],
            bank_Name: [bank.bank_Name, Validators.required],
            bank_Branch: [bank.bank_Branch, Validators.required]
          }));
        });
      } else {
        this.bankDetailsArray.push(this.createBankDetailGroup());
      }
    },
    error: (err) => console.error('GetEmployeeBankById Error:', err)
  });

  // ✅ Education Details
  this.service.GetEmployeeEduById(payload).subscribe({
    next: (res) => {
      this.educationArray.clear();
      if (res && res.length > 0) {
        this.educationArray.push(this.createEducationRow('SSLC'));
        this.educationArray.at(0).patchValue({
          course: '',
          institution: res[0].sslC_School,
          start: res[0].sslC_StartDate?.substring(0, 10),
          end: res[0].sslC_EndDate?.substring(0, 10)
        });
        this.educationArray.push(this.createEducationRow('HSC'));
        this.educationArray.at(1).patchValue({
          course: '',
          institution: res[0].hsS_School,
          start: res[0].hsS_StartDate?.substring(0, 10),
          end: res[0].hsS_EndDate?.substring(0, 10)
        });
        this.educationArray.push(this.createEducationRow('UG'));
        this.educationArray.at(2).patchValue({
          course: res[0].uG_Course,
          institution: res[0].uG_University,
          start: res[0].uG_StartDate?.substring(0, 10),
          end: res[0].uG_EndDate?.substring(0, 10)
        });
        this.educationArray.push(this.createEducationRow('PG'));
        this.educationArray.at(3).patchValue({
          course: res[0].pG_Course,
          institution: res[0].pG_University,
          start: res[0].pG_StartDate?.substring(0, 10),
          end: res[0].pG_EndDate?.substring(0, 10)
        });
        this.educationArray.push(this.createEducationRow('Certification'));
        this.educationArray.at(4).patchValue({
          course: res[0].certification_Course,
          institution: res[0].certification_University,
          start: res[0].certification_StartDate?.substring(0, 10),
          end: res[0].certification_EndDate?.substring(0, 10)
        });
        this.educationArray.push(this.createEducationRow('Professional Course'));
        this.educationArray.at(5).patchValue({
          course: res[0].professional_Course,
          institution: res[0].professional_University,
          start: res[0].professional_StartDate?.substring(0, 10),
          end: res[0].professional_EndDate?.substring(0, 10)
        });
      } else {
        this.educationArray.push(this.createEducationRow('SSLC'));
        this.educationArray.push(this.createEducationRow('HSC'));
        this.educationArray.push(this.createEducationRow('UG'));
        this.educationArray.push(this.createEducationRow('PG'));
        this.educationArray.push(this.createEducationRow('Certification'));
        this.educationArray.push(this.createEducationRow('Professional Course'));
      }
    },
    error: (err) => console.error('GetEmployeeEduById Error:', err)
  });

  // ✅ Previous Company Details
  this.service.GetEmployeePreCompById(payload).subscribe({
    next: (res) => {
      this.previousCompanyArray.clear();
      if (res && res.length > 0) {
        res.forEach((comp: any) => {
          this.previousCompanyArray.push(this.fb.group({
            company_Name: [comp.company_Name, Validators.required],
            designation: [comp.designation, Validators.required],
            breif_about_profile: [comp.breif_about_profile, Validators.required],
            lwd: [comp.lwd?.substring(0, 10), Validators.required],
            experience_letter: [null],
            payslip: [null]
          }));
        });
      } else {
        this.previousCompanyArray.push(this.createPreviousCompanyGroup());
      }
    },
    error: (err) => console.error('GetEmployeePreCompById Error:', err)
  });
}
  createBankDetailGroup(): any {
    throw new Error('Method not implemented.');
  }



  createPreviousCompanyGroup(): FormGroup {
    return this.fb.group({
      company_Name: ['', Validators.required],
      designation: ['', Validators.required],
      breif_about_profile: ['', Validators.required],
      lwd: ['', Validators.required],
      experience_letter: [null, Validators.required],  // must be present
  payslip: [null, Validators.required]
    });
  }

  // Tab navigation
  onTabClick(stepIndex: number) {
    if (stepIndex < this.activeTab || this.activeTab === 1) {
      this.activeTab = stepIndex;
      return;
    }

    const currentForm = this.getFormByTab(this.activeTab);
    if (this.validateCurrentForm(currentForm)) {
      this.activeTab = stepIndex;
    }
  }

  goToNextStep(currentForm: FormGroup) {
    if (this.validateCurrentForm(currentForm)) {
      this.activeTab++;
    }
  }

  private validateCurrentForm(form: FormGroup): boolean {
    if (form === this.educationDetailsForm) {
      return this.validateEducationForm();
    }

    if (form.valid) {
      return true;
    }

    form.markAllAsTouched();
    Swal.fire({
      icon: 'warning',
      title: 'Incomplete Form',
      text: 'Please fill all required fields before proceeding.'
    });
    return false;
  }

  private validateEducationForm(): boolean {
    let isValid = true;

    // Validate SSLC, HSC, UG groups
   this.educationArray.controls.forEach((group: AbstractControl) => {
  if (group.invalid) {
    isValid = false;
    group.markAllAsTouched();
  }
});
    if (!isValid) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Education',
        text: 'Please fill all education fields including certifications.'
      });
    }

    return isValid;
  }

  getFormByTab(tabIndex: number): FormGroup {
    switch (tabIndex) {
      case 1: return this.employeeMasterForm;
      case 2: return this.personalDetailsForm;
      case 3: return this.bankDetailsForm;
      case 4: return this.educationDetailsForm;
      case 5: return this.previousCompanyForm;
      default: return this.employeeMasterForm;
    }
  }

  // File handling
selectedPersonalFile: File | null = null;

onFileChange(event: Event, controlName: string) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    this.personalDetailsForm.get(controlName)?.setValue(file); // ✅ stores actual File object
    this.selectedPersonalFile = file; // Optional: for preview or label
  }
}




onPreviousCompanyFileChange(event: Event, index: number, controlName: string) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    this.previousCompanyArray.at(index).get(controlName)?.setValue(file);
  }
}

onEmployeeChanged(userId: string) {
  this.selectedEmployeeId = userId;
  console.log('Selected Employee ID:', userId);  // ✅ confirm in console
  this.loadAllEmployeeData();
}




  // Add/remove form array items
  addBankAccount() {
    this.bankDetailsArray.push(this.createBankGroup());
  }

  removeBankAccount(index: number) {
    if (this.bankDetailsArray.length > 1) {
      this.bankDetailsArray.removeAt(index);
    }
  }

  addCertification() {
    this.certificationArray.push(this.createCertificationGroup());
  }

  removeCertification(index: number) {
    if (this.certificationArray.length > 1) {
      this.certificationArray.removeAt(index);
    }
  }
get educationArray(): FormArray {
  return this.educationDetailsForm.get('educationRows') as FormArray;
}

createEducationRow(level: string): FormGroup {
  return this.fb.group({
    level: [level],
    course: ['', Validators.required],
    institution: ['', Validators.required],
    start: ['', Validators.required],
    end: ['', Validators.required]
  });
}

addEducationRow(index: number) {
  const currentLevel = this.educationArray.at(index).get('level')?.value || 'Certification';
  this.educationArray.insert(index + 1, this.createEducationRow(currentLevel));
}

removeEducationRow(index: number) {
  if (this.educationArray.length > 1) {
    this.educationArray.removeAt(index);
  }
}
toPascalCase(str: string): string {
  return str.replace(/(^\w|_\w)/g, match => match.replace('_', '').toUpperCase());
}

  addPreviousCompany() {
    this.previousCompanyArray.push(this.createPreviousCompanyGroup());
  }

  removePreviousCompany(index: number) {
    if (this.previousCompanyArray.length > 1) {
      this.previousCompanyArray.removeAt(index);
    }
  }

  // Form resets
  resetAllForms() {
    this.employeeMasterForm.reset();
    this.personalDetailsForm.reset();
    
    this.bankDetailsForm = this.fb.group({
      bankDetails: this.fb.array([this.createBankGroup()])
    });
    
   this.educationDetailsForm = this.fb.group({
  educationRows: this.fb.array([
    this.createEducationRow('SSLC'),
    this.createEducationRow('HSC'),
    this.createEducationRow('UG'),
    this.createEducationRow('PG'),
    this.createEducationRow('Certification'),
    this.createEducationRow('Professional Course')
  ])
});

    
    this.previousCompanyForm = this.fb.group({
      previousCompanyDetails: this.fb.array([this.createPreviousCompanyGroup()])
    });

    this.activeTab = 1;
    this.resetFileInputs();
  }

  private resetFileInputs() {
  this.selectedPersonalFile = null; // ✅ CORRECT property name
  if (this.fileInputRef) {
    this.fileInputRef.nativeElement.value = '';
  }
  this.personalDetailsForm.get('file')?.setValue('');
}



  // Form submissions
 submitMasterForm() {
  if (this.employeeMasterForm.valid) {
    const payload = {
      ...this.employeeMasterForm.value,
      
      created_By: sessionStorage.getItem('userId')
    };

    this.service.InsertEmployeeDetails(payload).subscribe({
      next: (res) => {
        if (res[0]?.statuscode === 200) {
          Swal.fire('Success', res[0].description, 'success').then(() => {
            this.employeeMasterForm.reset();
          });
        } else {
          Swal.fire('Error', res[0]?.description || 'Submission failed.', 'error');
        }
      },
      error: (err) => {
        console.error('Submission Error:', err);
        Swal.fire('Backend Error', 'Something went wrong. Please check the console.', 'error');
      }
    });
  } else {
    this.employeeMasterForm.markAllAsTouched();
    Swal.fire({
      icon: 'warning',
      title: 'Incomplete Form',
      text: 'Please fill all required fields in Employee Master tab.'
    });
  }
}


 submitPersonalForm() {
  if (this.personalDetailsForm.valid) {
    const formData = new FormData();

    const file = this.personalDetailsForm.get('file')?.value;
    if (!(file instanceof File)) {
      Swal.fire('Error', 'Please upload a valid file.', 'error');
      return;
    }

    formData.append('file', file);

    // Append form fields
    const fields = [
      'date_of_Birth',
      'gender',
      'paN_No',
      'aadhaar_Card_Number',
      'marital_Status',
      'blood_Group',
      'fathers_Name',
      'mothers_Name',
      'spouse_Name',
      'number_of_kids',
      'permanent_Address',
      'emergency_Contact_Name_2'
    ];

   fields.forEach(field => {
  formData.append(field, this.personalDetailsForm.get(field)?.value || '');
});


    // formData.append('Professional_photo', ''); // You can remove or adjust this if not needed
    formData.append('Created_By', sessionStorage.getItem('userId') || '');

    this.service.getprofile(formData).subscribe({
      next: (res) => {
        if (res[0]?.statuscode === 200) {
          Swal.fire('Success', res[0].description || 'Personal Details Submitted ✅', 'success').then(() => {
            this.personalDetailsForm.reset();
            this.resetFileInputs(); // Reset file inputs in DOM if needed
          });
        } else {
          Swal.fire('Error', res[0]?.description || 'Submission failed ❌', 'error');
        }
      },
      error: (err) => {
        console.error('Personal Submit Error:', err);
        Swal.fire('Backend Error', 'Failed to submit personal details ❌', 'error');
      }
    });

  } else {
    this.personalDetailsForm.markAllAsTouched();
    Swal.fire({
      icon: 'warning',
      title: 'Incomplete Form',
      text: 'Please fill all required fields in the Personal Details tab.'
    });
  }
}


  submitBankForm() {
    if (this.bankDetailsForm.valid) {
      const payload = {
        employee_Id: this.employeeMasterForm.value.employee_Id,
        created_By: sessionStorage.getItem('userId'),
        bankDetails: this.bankDetailsForm.value.bankDetails
      };

      this.service.InsertEmpBankDetails(payload).subscribe({
        next: (res) => {
          Swal.fire('Success', 'Bank Details Submitted ✅', 'success');
        },
        error: (err) => {
          console.error('Bank Submit Error:', err);
          Swal.fire('Error', 'Failed to submit bank details ❌', 'error');
        }
      });
    } else {
      this.bankDetailsForm.markAllAsTouched();
    }
  }

  submitEducationForm() {
  if (this.educationDetailsForm.valid) {
    const payload = {
      employee_Id: sessionStorage.getItem('userId'),
      created_By: sessionStorage.getItem('userId'),
      educationDetails: this.transformEducationRows(this.educationDetailsForm.value.educationRows)
    };

    this.service.InsertEmpEducationDetails(payload).subscribe({
      next: (res) => {
        if (res[0]?.statuscode === 200) {
          Swal.fire('Success', res[0].description || 'Education Details Submitted ✅', 'success').then(() => {
            this.educationDetailsForm.reset();
          });
        } else {
          Swal.fire('Error', res[0]?.description || 'Submission failed ❌', 'error');
        }
      },
      error: (err) => {
        console.error('Education Submit Error:', err);
        Swal.fire('Backend Error', 'Failed to submit education details ❌', 'error');
      }
    });
  } else {
    this.educationDetailsForm.markAllAsTouched();
    Swal.fire({
      icon: 'warning',
      title: 'Validation Error',
      text: 'Please fill all education fields.'
    });
  }
}



  submitPreviousCompanyForm() {
  if (this.previousCompanyForm.valid) {
    const formValues = this.previousCompanyForm.value.previousCompanyDetails;
    const formData = new FormData();

    const userId = sessionStorage.getItem('userId') || '';
    formData.append('Employee_Id', userId);
    formData.append('Created_By', userId);

    for (let index = 0; index < formValues.length; index++) {
  const company = formValues[index];

  // Append required fields
  formData.append('Company_Name', company.company_Name || '');
  formData.append('Designation', company.designation || '');
  formData.append('Breif_about_profile', company.breif_about_profile || '');
  formData.append('LWD', company.lwd || '');

  // Get files
  const expLetter = (this.previousCompanyArray.at(index) as FormGroup).get('experience_letter')?.value;
  const payslip = (this.previousCompanyArray.at(index) as FormGroup).get('payslip')?.value;

  // Validate file types
  if (!(expLetter instanceof File)) {
    Swal.fire('Error', `Please upload Experience Letter for row ${index + 1}`, 'error');
    return;
  }

  if (!(payslip instanceof File)) {
    Swal.fire('Error', `Please upload Payslip for row ${index + 1}`, 'error');
    return;
  }

  // Append files correctly (only once)
  formData.append('Experience_letter', expLetter);
  formData.append('Payslip', payslip);
}

    // Optional: Debug formData
    // for (let pair of formData.entries()) {
    //   console.log(pair[0] + ':', pair[1]);
    // }

    this.service.InsertEmpPreCompanyDetails(formData).subscribe({
      next: (res) => {
        if (res[0]?.statuscode === 200) {
          Swal.fire('Success', res[0].description || 'Previous Company Details Submitted ✅', 'success').then(() => {
            this.previousCompanyForm.reset();
          });
        } else {
          Swal.fire('Error', res[0]?.description || 'Submission failed ❌', 'error');
        }
      },
      error: (err) => {
        console.error('Previous Company Submit Error:', err);
        Swal.fire('Backend Error', 'Failed to submit previous company details ❌', 'error');
      }
    });

  } else {
    this.previousCompanyForm.markAllAsTouched();
    Swal.fire({
      icon: 'warning',
      title: 'Validation Error',
      text: 'Fill all previous company fields.'
    });
  }
}


submitAllEmployeeDetails() {
  if (
    this.personalDetailsForm.valid &&
    this.bankDetailsForm.valid &&
    this.educationDetailsForm.valid &&
    this.previousCompanyForm.valid
  ) {
    this.submitPersonalForm();
    this.submitBankForm();
    this.submitEducationForm();
    this.submitPreviousCompanyForm();

    // setTimeout(() => {
    //   Swal.fire({
    //     icon: 'success',
    //     title: 'Success ✅',
    //     text: 'All details submitted successfully!'
    //   }).then(() => {
    //     window.location.reload(); // ✅ Refresh the entire page after submit
    //   });
    // }, 1000);
  } else {
    this.personalDetailsForm.markAllAsTouched();
    this.bankDetailsForm.markAllAsTouched();
    this.educationDetailsForm.markAllAsTouched();
    this.previousCompanyForm.markAllAsTouched();

    Swal.fire({
      icon: 'warning',
      title: 'Validation Error ❌',
      text: 'Please fill all required fields in all tabs before submitting.'
    });
  }
}


}