import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { from } from 'rxjs';

@Component({
  selector: 'app-employee-master',
  imports: [MatDatepickerModule, MatFormFieldModule,ReactiveFormsModule, MatNativeDateModule,],
  templateUrl: './employee-master.component.html',
  styleUrl: './employee-master.component.scss',
  providers: [DatePipe]
})
export class EmployeeMasterComponent implements OnInit{
  @ViewChild('picker') datepicker!: MatDatepicker<Date>;


form!: FormGroup;
partternMismatch = false;
passwordStrength: number = 0;  
constructor(private _FB: FormBuilder)
{

}

ngOnInit()
{
  this.formInit();
}

formInit()
{
  this.form = this._FB.group({
    password:  ['',Validators.required],
  });
}

  openDatepicker(): void {
    this.datepicker.open();
  }

 
  passWordStrength() {
    const weakPassword = new RegExp(/^(?:\d+|[A-Za-z]+)$/); // Only numbers OR only letters
    const mediumPassword = new RegExp(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/); // Numbers + Letters
    const strongPassword = new RegExp(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/); // Numbers + Letters + Special Characters
    
    var form = this.form.getRawValue();
    console.log(form.password);
    this.passwordStrength = 0;
    
    if (form.password.length > 1) {
        this.passwordStrength = 30;
    }
    
    // Strong Password (100%)
    if (strongPassword.test(this.form.controls['password'].value)) {
        this.passwordStrength = 100;
    } 
    // Medium Password (65%)
    else if (mediumPassword.test(this.form.controls['password'].value)) {
        this.passwordStrength = 65;
    } 
    // Weak Password (30%)
    else if (weakPassword.test(this.form.controls['password'].value)) {
        this.passwordStrength = 30;
    }
}

}
