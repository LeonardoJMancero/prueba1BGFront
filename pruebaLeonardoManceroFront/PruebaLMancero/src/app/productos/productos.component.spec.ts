import { ComponentFixture, TestBed } from '@angular/core/testing';
import { productosComponent } from './productos.component';


describe('ProductosComponent', () => {
  let component: productosComponent;
  let fixture: ComponentFixture<productosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [productosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(productosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
