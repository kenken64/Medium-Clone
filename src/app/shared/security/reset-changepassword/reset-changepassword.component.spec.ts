import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetChangepasswordComponent } from './reset-changepassword.component';

describe('ResetChangepasswordComponent', () => {
  let component: ResetChangepasswordComponent;
  let fixture: ComponentFixture<ResetChangepasswordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResetChangepasswordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetChangepasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
