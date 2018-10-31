import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthorsService } from '../../../shared/services/authors.service';
import { CategoryService } from '../../../shared/services/category.service';
import { ArticleService } from '../../../shared/services/article.service';
import { MatSnackBar } from '@angular/material';

import { Author } from '../../../shared/models/author';
import { Category } from '../../../shared/models/category'
import { Article } from '../../../shared/models/article';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}
const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
];

@Component({
  selector: 'app-publish',
  templateUrl: './publish.component.html',
  styleUrls: ['./publish.component.css']
})
export class PublishComponent implements OnInit {
  authors: Author[]= [];
  categories: Category[] = [];
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = ELEMENT_DATA;
  
  publishArticleForm = new FormGroup({
    title: new FormControl('', Validators.required),
    author: new FormControl('', Validators.required),
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
    
  }

  onSubmit() {
    console.log(this.publishArticleForm.get("author").value);
    console.log(this.publishArticleForm.get("category").value);
    console.log(this.publishArticleForm.get("article").value);
    var article: Article = {
      title: this.publishArticleForm.get("title").value,
      author: this.publishArticleForm.get("author").value,
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
