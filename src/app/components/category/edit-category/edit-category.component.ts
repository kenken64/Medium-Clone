import { Component, OnInit, OnDestroy, Output, EventEmitter} from '@angular/core';
import { Subscription }   from 'rxjs';
import { CategoryService } from '../../../shared/services/category.service';

@Component({
  selector: 'app-edit-category',
  templateUrl: './edit-category.component.html',
  styleUrls: ['./edit-category.component.css']
})
export class EditCategoryComponent implements OnInit,OnDestroy {
  @Output() categoryEditEvt = new EventEmitter<string>();
  step = 0;

  setStep(index: number) {
    this.step = index;
  }
  subscription: Subscription;
  name: string;

  constructor(private catSvc: CategoryService) { 
    this.subscription = this.catSvc.getEditCategoryName$().subscribe(
      name => {
        this.name = name;
    });
  }

  ngAfterViewInit()	{
    
  }

  ngOnInit() {
    
  }

  onEdit(){
    console.log(this.name);
    this.categoryEditEvt.emit(this.name);
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.subscription.unsubscribe();
  }

}
