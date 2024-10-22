import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ContentUrlComponent} from './content-url.component';

describe('ContentUrlComponent', () => {
  let component: ContentUrlComponent;
  let fixture: ComponentFixture<ContentUrlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentUrlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContentUrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
