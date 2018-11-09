import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { MatSnackBar } from '@angular/material';
import { Author } from '../../../shared/models/author';
import { AuthorsService } from '../../../shared/services/authors.service';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-edit-author',
  templateUrl: './edit-author.component.html',
  styleUrls: ['./edit-author.component.css']
})
export class EditAuthorComponent implements OnInit {
  uploadAPI: string = `${environment.api_url}/api/upload`
  currentUploadURL: string;
  color = 'primary';
  mode = 'indeterminate';
  value = 50;
  spinnerFlag: boolean = false;
  multipleFilesUpload = [];
  author: Author;

  editAuthorForm = new FormGroup({
    firstname: new FormControl('', Validators.required),
    lastname: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    profile: new FormControl('', Validators.required),
    thumbnail_url: new FormControl('', Validators.required)
  });

  constructor(private authorSvc: AuthorsService, 
    private snackSvc: MatSnackBar,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    let id = this.activatedRoute.snapshot.params.id;
    console.log(id);
    this.authorSvc.getAuthor(id).subscribe((result)=>{
      console.log(JSON.stringify(result))
      this.editAuthorForm.patchValue({
        id: result.id,
        firstname: result.firstname,
        lastname: result.lastname,
        email: result.email,
        profile: result.profile,
        thumbnail_url: result.thumbnail_url
      });
      this.author = result;
    })
  }

  onSubmit() {
    console.log(this.editAuthorForm.get("firstname").value);
    console.log(this.editAuthorForm.get("lastname").value);
    console.log(this.editAuthorForm.get("profile").value);
    var authorObj: Author = {
      id: this.author.id,
      firstname: this.editAuthorForm.get("firstname").value,
      lastname: this.editAuthorForm.get("lastname").value,
      email: this.editAuthorForm.get("email").value,
      profile: this.editAuthorForm.get("profile").value,
      thumbnail_url: this.multipleFilesUpload[0],
    }
    this.authorSvc.editAuthor(authorObj).subscribe((result)=>{
      let snackBarRef = this.snackSvc.open("Author Updated", 'Done', {
        duration: 3000
      });
    })
  }

  doneUpload(evt){
    console.log(evt.file);
    console.log(">>>" + JSON.stringify(evt.event));
    let evtObj = {... evt.event};
    console.log(">>>" + evtObj);
    this.spinnerFlag = true;
    if(typeof(evtObj.body) !== 'undefined'){
      console.log(evtObj.body);
        this.currentUploadURL = evtObj.body;
        this.multipleFilesUpload.push(this.currentUploadURL);
        this.author.thumbnail_url = this.multipleFilesUpload[0],
        this.spinnerFlag = false;
    }
    
  }

}
