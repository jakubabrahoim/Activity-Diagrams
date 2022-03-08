import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagramPaperComponent } from './diagram-paper.component';

describe('DiagramPaperComponent', () => {
  let component: DiagramPaperComponent;
  let fixture: ComponentFixture<DiagramPaperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiagramPaperComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DiagramPaperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
