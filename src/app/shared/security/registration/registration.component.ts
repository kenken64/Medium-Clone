import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SecurityService } from '../../services/security.service';
import { User } from '../../models/user';
import { PasswordValidation } from '../../validation/password-match';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
  registrationForm: FormGroup;
  PASSWORD_PATTERN = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{12,}$/;
  
  constructor(private securitySvc: SecurityService, 
    private fb: FormBuilder,
    private snackSvc: MatSnackBar) { 
    this.registrationForm = fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern(this.PASSWORD_PATTERN)]],
      confirmPassword: ['', Validators.required],
      fullName: ['', Validators.required]
    }, {
      validator: [PasswordValidation.MatchPassword]
    })

  }

  ngOnInit() {
  }

  onSubmit(){
    let confirmPassword = this.registrationForm.get("confirmPassword").value;
    let email = this.registrationForm.get("email").value;
    let fullName = this.registrationForm.get("fullName").value;
    
    let registerUser: User = {
      email: email,
      password: confirmPassword,
      fullName: fullName
    }
    ///first hash to the server side
    if(this.registrationForm.valid){
      this.securitySvc.register(registerUser).subscribe((result)=>{
        console.log(result);
        let snackBarRef = this.snackSvc.open("Registration Ok!", 'Done', {
          duration: 3000
        });
      })
    }else{
      let snackBarRef = this.snackSvc.open("Invalid !", 'Done', {
        duration: 3000
      });
    }
    
  }

}
