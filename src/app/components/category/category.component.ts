import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { CategoryService } from '../../shared/services/category.service';
import { Category } from '../../shared/models/category';
@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryComponent implements OnInit {
  categories: Category[];
  isNew: boolean = true;
  currentEditIdx: number = 0;
  public config: PerfectScrollbarConfigInterface = {};

  constructor(private catSvc: CategoryService) { }

  ngOnInit() {
    
  }

  ngAfterViewInit()	{
    this.catSvc.getCategories().subscribe((result)=>{
      console.log(">>>> cat result" + result);
      this.categories = result;
    })
  }

  onNew(){
    this.isNew = true;
  }

  onAddCategory($category){
    console.log($category);
    let category: Category = {
      result: {name: $category},
      name: $category
    }
    this.catSvc.addCategory(category).subscribe((result)=>{
      console.log(result);
      this.categories.push(category);
    });
  }

  onEditCategory($category){
    console.log($category);
    let categoryEditval = this.categories[this.currentEditIdx];
    console.log(categoryEditval.result.name);
    console.log(categoryEditval.id);
    categoryEditval.result.name = $category;
    categoryEditval.name = $category;
    this.catSvc.editCategory(categoryEditval).subscribe((result)=>{
      console.log(result);
      this.categories[this.currentEditIdx] = categoryEditval;
    });
  }

  doEdit(index, name){
    this.isNew = false;
    this.currentEditIdx = index;
    this.catSvc.editNameBroadcast(name);
  }

}
