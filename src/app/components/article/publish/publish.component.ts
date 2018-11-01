import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthorsService } from '../../../shared/services/authors.service';
import { CategoryService } from '../../../shared/services/category.service';
import { ArticleService } from '../../../shared/services/article.service';
import { MatSnackBar } from '@angular/material';

import { Author } from '../../../shared/models/author';
import { Category } from '../../../shared/models/category'
import { Article } from '../../../shared/models/article';


const ELEMENT_DATA: Article[] = [];

@Component({
  selector: 'app-publish',
  templateUrl: './publish.component.html',
  styleUrls: ['./publish.component.css']
})
export class PublishComponent implements OnInit {
  authors: Author[]= [];
  categories: Category[] = [];
  articles: Article[] = [];
  displayedColumns: string[] = ['id', 'title', 'author', 'category'];
  dataSource = ELEMENT_DATA;
  
  publishArticleForm = new FormGroup({
    title: new FormControl('', Validators.required),
    category: new FormControl('', Validators.required),
    article: new FormControl('', Validators.required)
  });
  constructor(private authorSvc: AuthorsService, 
    private categorySvc: CategoryService,
    private articleSvc: ArticleService,
    private snackSvc: MatSnackBar) { }

  ngOnInit() {
    this.authorSvc.getAuthors().subscribe((result)=>{
      this.authors = result;
    });

    this.categorySvc.getCategories().subscribe((result)=>{
      console.log(result);
      this.categories = result;
    });
    
    // retrieve articles by author's email.
    
    this.articleSvc.getArticlesByAuthor().subscribe((result)=>{
      console.log(result);
      this.articles = result;
    })
  }

  onSubmit() {
    console.log(this.publishArticleForm.get("category").value);
    console.log(this.publishArticleForm.get("article").value);
    var article: Article = {
      title: this.publishArticleForm.get("title").value,
      category: this.publishArticleForm.get("category").value,
      publish_date: new Date(),
      article: this.publishArticleForm.get("article").value,
    }
    if(this.publishArticleForm.valid){
      this.articleSvc.publishArticle(article).subscribe((result)=>{
        console.log(result);
        let snackBarRef = this.snackSvc.open("Article added", 'Done', {
          duration: 3000
        });
      })
    }else{
      let snackBarRef = this.snackSvc.open("Invalid", 'Done', {
        duration: 3000
      });
    }
    
  }

}
