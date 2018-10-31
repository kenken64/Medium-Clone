import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SecurityService } from '../../services/security.service';
import { User } from '../../models/user';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  PASSWORD_PATTERN = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{12,}$/;
  loginForm :FormGroup;

  constructor(private fb: FormBuilder, 
    private securitySvc: SecurityService,
    private snackSvc:  MatSnackBar,
    private router: Router) {
    this.loginForm = fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern(this.PASSWORD_PATTERN)]],
    })
   }

  ngOnInit() {
  }

  onSubmit(){
    let password = this.loginForm.get("password").value;
    let email = this.loginForm.get("email").value;
    
    let loginUser: User = {
      email: email,
      password: password
    }
    //first hash to the server side
    if(this.loginForm.valid){
      this.securitySvc.login(loginUser).subscribe((result)=>{
        console.log(result);
        let snackBarRef = this.snackSvc.open("Login Successful!", 'Done', {
          duration: 3000
        });
        this.router.navigate(['/Article']);
      })
    }else{
      let snackBarRef = this.snackSvc.open("Invalid!", 'Done', {
        duration: 3000
      });
    }
  }

}
