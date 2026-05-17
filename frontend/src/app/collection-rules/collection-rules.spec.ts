import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionRules } from './collection-rules';

describe('CollectionRules', () => {
  let component: CollectionRules;
  let fixture: ComponentFixture<CollectionRules>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionRules],
    }).compileComponents();

    fixture = TestBed.createComponent(CollectionRules);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
