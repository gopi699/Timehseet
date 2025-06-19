import { TextFieldModule } from '@angular/cdk/text-field';
import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, NgForm, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';

import { finalize } from 'rxjs';

@Component({
    selector: 'auth-forgot-password',
    templateUrl: './forgot-password.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [NgIf,  TextFieldModule,
        FormsModule, ReactiveFormsModule, MatFormFieldModule,
        MatInputModule, MatIcon, MatButtonModule,
        MatProgressSpinnerModule, 
        MatStepperModule],
})
export class ForgotPasswordComponent implements OnInit {
    passwordForm!: FormGroup;
    emailForm!: FormGroup;

    partternMismatch: boolean = false;
    passwordMismatch: boolean = false;
    passwordStrength: any = 0;
    pass1: any = 'password';
    pass2: any = 'password';
    validEmail: boolean = false;
    nextbutton: boolean = true;
    isLinear = true;


    constructor(private fb: FormBuilder) {

    }
    ngOnInit(): void {
        // Create the form
        //    
        this.initForm();
    }

  
    initForm() {
        this.emailForm = this.fb.group({
            email: ['', Validators.required],
        })
        this.passwordForm = this.fb.group({
            password: ['', Validators.required],
            conPassword: ['', Validators.required]
        })

    }

    passWordStrength() {
        const weakPassword = new RegExp(/^(?:\d+|[A-Za-z]+)$/); // Only numbers OR only letters
        const mediumPassword = new RegExp(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/); // Numbers + Letters
        const strongPassword = new RegExp(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/); // Numbers + Letters + Special Characters
        
        var form = this.passwordForm.getRawValue();
        console.log(form.password);
        this.passwordStrength = 0;
        
        if (form.password.length > 1) {
            this.passwordStrength = 30;
        }
        
        // Strong Password (100%)
        if (strongPassword.test(this.passwordForm.controls['password'].value)) {
            this.passwordStrength = 100;
        } 
        // Medium Password (65%)
        else if (mediumPassword.test(this.passwordForm.controls['password'].value)) {
            this.passwordStrength = 65;
        } 
        // Weak Password (30%)
        else if (weakPassword.test(this.passwordForm.controls['password'].value)) {
            this.passwordStrength = 30;
        }
    }
    validatedPassword() {
        const regex = new RegExp(
            /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
        );
        var form = this.passwordForm.getRawValue();
        if (regex.test(form.password)) {
            this.partternMismatch = false;
        } else {
            this.partternMismatch = true;
            // this.passwordForm.setErrors({ invalid: true });
        }
    }
    passwordMatch() {
        var form = this.passwordForm.getRawValue();
        if (
            form.password.value !=
            form.conPassword.value
        ) {
            this.passwordMismatch = true;
            this.passwordForm.controls['password'].setErrors({ invalid: true });

            this.passwordForm.controls['conPassword'].setErrors({ invalid: true });
            this.passwordForm.controls['password'].invalid;
            this.passwordForm.controls['conPassword'].invalid;
        } else {
            this.passwordForm.controls['password'].valid;
            this.passwordForm.controls['conPassword'].valid;

            this.passwordMismatch = false;
        }
    }
    DisableCut(event: any) {
        // this.toastr.warning
        alert('Cut operation is not allowed');
        event.preventDefault();
    }
    DisableCopy(event: any) {
        // this.toastr.warning
        alert("You can't copy this information");
        event.preventDefault();
    }
    DisablePaste(event: any) {
        // this.toastr.warning
        alert("You can't paste in this input");
        event.preventDefault();
    }
    pass1Vissible() {
        this.pass1 = this.pass1 == 'text' ? 'password' : 'text';
    }
    pass2Vissible() {
        this.pass2 = this.pass2 == 'text' ? 'password' : 'text';
    }
    resetForm() {
        if (confirm('Are you sure you want reset form ? ')) {
            this.initForm();
            this.passwordStrength = 0;
            this.passwordMismatch = true;
        } else {
        }
    }
}
