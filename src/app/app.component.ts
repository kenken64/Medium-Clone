import { Component } from '@angular/core';
import { SecurityService } from './shared/services/security.service';
import { User } from './shared/models/user'; 

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ngx-blog';

  constructor(private userService:SecurityService){
    console.log(this.userService.getCurrentUser());
    let user: User = this.userService.getCurrentUser();
    if(JSON.stringify(user) == "{}"){
      this.userService.logout();
    }
  }
}
