import { Component, OnInit, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
    private snackSvc: MatSnackBar,
    private changeDetectorRefs: ChangeDetectorRef) { }

  ngOnInit() {
    this.authorSvc.getAuthors().subscribe((result)=>{
      this.authors = result;
    });

    this.categorySvc.getCategories().subscribe((result)=>{
      console.log(result);
      this.categories = result;
    });
    
    // retrieve articles by author's email.
    this.refresh();
  }

  refresh() {
    this.articleSubscription = this.articleSvc.getArticlesByAuthor().subscribe((results)=>{
      //console.log(results);
      let finalResults = [];
      results.forEach((element)=>{
        //console.log(element);
        this.categories.forEach((categoryValue)=>{
          //console.log(categoryValue.id);
          //console.log(element.category);
          if(element.category == categoryValue.id){
            console.log("found !");
            element.category_name = categoryValue.result.name;
            finalResults.push(element);
          }
        })
      });
      console.log(finalResults);
      this.dataSource = new MatTableDataSource(finalResults);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.changeDetectorRefs.detectChanges();
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
        this.refresh();
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
