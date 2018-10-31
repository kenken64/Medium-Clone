import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { SecurityService } from '../../services/security.service';
import { MatSnackBar } from '@angular/material';
import { User } from '../../models/user';
import { PasswordValidation } from '../../validation/password-match';
import { Router } from '@angular/router';


@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
  changePasswordForm: FormGroup;
  PASSWORD_PATTERN = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{12,}$/;

  constructor(private securitySvc: SecurityService,
    private fb: FormBuilder,
    private snackSvc: MatSnackBar,
    private router: Router) {
    this.changePasswordForm = fb.group({
      currentPassword: ['', Validators.required],
      password: ['', [Validators.required, Validators.pattern(this.PASSWORD_PATTERN)]],
      confirmPassword: ['', Validators.required]
    }, {
        validator: [PasswordValidation.MatchPassword]
      })

  }

  ngOnInit() {
  }

  onSubmit() {
    let confirmPassword = this.changePasswordForm.get("confirmPassword").value;
    let updateUser: User = {
      password: this.changePasswordForm.value.currentPassword,
      newpassword: confirmPassword
    }
    console.log(this.changePasswordForm);
    console.log("Confirm password :", this.changePasswordForm.controls['confirmPassword'].hasError('MatchPassword'));
    if (this.changePasswordForm.controls['confirmPassword'].hasError('MatchPassword')) {  //mismatch
      let snackBarRef = this.snackSvc.open("Password mismatch or empty. Please try Again!", 'Done', {
        duration: 5000
      });
    } else if (this.changePasswordForm.get("confirmPassword").value.length == 0) {
      let snackBarRef = this.snackSvc.open("Password empty. Please try Again!", 'Done', {
        duration: 5000
      });
    } else {
      this.securitySvc.changePassword(updateUser).subscribe((result) => {
        console.log(result);
        this.securitySvc.logout(); //force logout
        this.router.navigate(['/Login']);
        let snackBarRef = this.snackSvc.open("Password Updated. Please Log In Again!", 'Done', {
          duration: 3000
        });
      })
    }
  }
}