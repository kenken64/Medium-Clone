import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SecurityService } from '../../services/security.service';
import { User } from '../../models/user';
import { PasswordValidation } from '../../validation/password-match';
import { MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-reset-changepassword',
  templateUrl: './reset-changepassword.component.html',
  styleUrls: ['./reset-changepassword.component.css']
})
export class ResetChangepasswordComponent implements OnInit {
  changePasswordForm: FormGroup;
  resetId: string;
  PASSWORD_PATTERN = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{12,}$/;
  
  constructor(private securitySvc: SecurityService, 
    private fb: FormBuilder,
    private snackSvc: MatSnackBar,
    private activatedRoute: ActivatedRoute,
    private router: Router) { 
      this.changePasswordForm = this.fb.group({
        password: ['', [Validators.required, Validators.pattern(this.PASSWORD_PATTERN)]],
        confirmPassword: ['', Validators.required],
      }, {
        validator: [PasswordValidation.MatchPassword]
      })
  }

  ngOnInit() {
    //this.resetId = this.activatedRoute.snapshot.params.resetId;
    this.activatedRoute.params.subscribe(params => {
        console.log("PARAMS" + params)
        console.log("RESET ID " + params.resetId)
        if(typeof(params.resetId) !== 'undefined'){
          this.resetId = params.resetId;
        }else{
            this.router.navigate(['/Article'])
        }
    }); 
  }

  onSubmit(){
    let confirmPassword = this.changePasswordForm.get("confirmPassword").value;
    
    let changePasswordForUser: User = {
      password: confirmPassword,
      resetId: this.resetId
    }
    ///first hash to the server side
    if(this.changePasswordForm.valid){
      this.securitySvc.changePasswordWithResetId(changePasswordForUser).subscribe((result)=>{
        this.snackSvc.open("Gratz password changed!", 'Done', {
          duration: 3000
        });
      })
    }else{
      this.snackSvc.open("Invalid !", 'Done', {
        duration: 3000
      });
    }
  }
}
