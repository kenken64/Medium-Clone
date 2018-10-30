import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../models/category';
import { Subject }    from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categoryRootApiUrl = `/api/categories`;
  private editCategoryNameSource = new Subject<string>();
  editCategoryName$ = this.editCategoryNameSource.asObservable();
  
  constructor(private http: ApiService) { }

  public getCategories(): Observable<Category[]> {
    return this.http.get(this.categoryRootApiUrl);
  }

  editNameBroadcast(name: string) {
    this.editCategoryNameSource.next(name);
  }

  getEditCategoryName$() : Observable<any>
  {
    return this.editCategoryName$;
  }
  
  editCategory(details): Observable<Category> {
    console.log(details);
    return this.http.put(this.categoryRootApiUrl, details);
  }

  addCategory(category): Observable<any> {
    return this.http.post(this.categoryRootApiUrl, category);
  }
}
