import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SecurityService } from '../../services/security.service';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup

  constructor(private fb: FormBuilder, 
    private securitySvc: SecurityService,
    private snackSvc:  MatSnackBar,
    private router: Router) {
    this.resetPasswordForm = fb.group({
      email: ['', [Validators.required, Validators.email]],
    })
   }

  ngOnInit() {

  }

  onSubmit(){
    let email = this.resetPasswordForm.get("email").value;
    let resetPasswordObj = {
      email: email,
    }
    this.securitySvc.resetPassword(resetPasswordObj).subscribe((result)=>{
      let snackBarRef = this.snackSvc.open("Password reset, Kindly please check your email!", 'Done', {
        duration: 3000
      });
      this.router.navigate(['/Login']);
    })
  }

}
