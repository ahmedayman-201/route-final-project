import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WishlistModal } from './wishlist-modal';

describe('WishlistModal', () => {
  let component: WishlistModal;
  let fixture: ComponentFixture<WishlistModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WishlistModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WishlistModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
