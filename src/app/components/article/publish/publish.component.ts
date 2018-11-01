import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthorsService } from '../../../shared/services/authors.service';
import { CategoryService } from '../../../shared/services/category.service';
import { ArticleService } from '../../../shared/services/article.service';
import { MatSnackBar } from '@angular/material';
import { MatSort, MatTableDataSource, MatPaginator } from '@angular/material'; // sort
import { Subscription } from 'rxjs';

import { Author } from '../../../shared/models/author';
import { Category } from '../../../shared/models/category'
import { Article } from '../../../shared/models/article';

@Component({
  selector: 'app-publish',
  templateUrl: './publish.component.html',
  styleUrls: ['./publish.component.css']
})
export class PublishComponent implements OnInit, OnDestroy  {

  authors: Author[]= [];
  categories: Category[] = [];
  displayedColumns: string[] = ['title', 'author', 'category'];
  dataSource: MatTableDataSource<Article>;
  articleSubscription: Subscription;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

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
    
    this.articleSubscription = this.articleSvc.getArticlesByAuthor().subscribe((results)=>{
      console.log(results);
      this.dataSource = new MatTableDataSource(results);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    })
  }

  onSubmit() {
    console.log(this.publishArticleForm.get("category").value);
    console.log(this.publishArticleForm.get("article").value);
    let article: Article = {
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

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  ngOnDestroy() {
    if (this.articleSubscription) {
      this.articleSubscription.unsubscribe();
    }
  }
}
