import { Component, Injectable } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import * as CryptoJS from 'crypto-js';
import { Router } from '@angular/router'; // Next page redirection
import { DbservicesService } from '../dbservices.service'; // Correct import statement
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.routes';


@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  encryptData(data: string, key: string): string {
    return CryptoJS.AES.encrypt(data, key).toString();
  }

  decryptData(data: string, key: string): string {
    const bytes = CryptoJS.AES.decrypt(data, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  
  LoginForm: FormGroup;
  Visible: boolean = true;
  changetype: boolean = true;
  private encryptionKey = 'your-encryption-key';
  decryptedPassword: string = '';
  userNotFound: boolean = false;
  passwordIncorrect: boolean = false;

  constructor( public dialog: MatDialog,private dbService: DbservicesService, private fb: FormBuilder, private encryptionService: EncryptionService, private router: Router) {
    this.LoginForm = this.fb.group({
      user_Id: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }
  
  
  press() {
    this.Visible = !this.Visible;
    this.changetype = !this.changetype;
  }

  onSubmit() {
    if (this.LoginForm.valid) {
      const formData = this.LoginForm.getRawValue();
      // const encryptedPassword = this.encryptionService.encryptData(formData.password, this.encryptionKey);

      // console.log('Form is valid');
      // console.log("LoginForm Data:", { ...formData });

      //  , password: encryptedPassword

      // this.decryptedPassword = this.encryptionService.decryptData(encryptedPassword, this.encryptionKey);
      // console.log("Decrypted Password:", this.decryptedPassword);

      this.dbService.login(formData).subscribe(
        (response: any) => {
          if (response[0].statusText == "Success") {
            sessionStorage.setItem('userId', response[0].id);
            sessionStorage.setItem('roleId', response[0].roleId);
            sessionStorage.setItem('UserName',response[0].user_Name);
            sessionStorage.setItem('accesstoken',response[0].accesstoken);
            // this.dbService.setUserId(response[0].user_Id);
            //console.log('User ID is available');
            //alert('User ID is available');
            this.router.navigate(['/dashboard']).then(() => {
              console.log('Navigation successful');
            }).catch((err) => {
              console.error('Navigation error:', err);
            });
          } else {
            if (response[0].id == '0') {
              this.userNotFound = true;
              this.passwordIncorrect = false;
            } else if (response.error === 'PASSWORD_INCORRECT') {
              this.userNotFound = false;
              this.passwordIncorrect = true;
            }
          }
        },
        (error: any) => {
          console.error('Login failed', error);
          this.userNotFound = error.status === 404;
          this.passwordIncorrect = error.status === 401;
        }
      );

      this.LoginForm.reset();
    } else {
      console.log('Form is invalid');
    }
  }
  _forgotPasswordpopup() {
      
    const dialogRef = this.dialog.open(ForgotPasswordComponent, {
      height: '100%',
        width: '650px',
    });
    // dialogRef.componentInstance.expandpopup = msg;
    dialogRef.afterClosed().subscribe((result) => {
  
      this.router.navigate(['Transaction/boq']);
    });
  }
}