import { Component, Directive, ElementRef, HostListener } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Respuestas } from '../models/model';

import { PageEvent } from '@angular/material/paginator';
import { consultarProductos, deletedProductos } from '../models/consultarProductos';



@Component({
  selector: '[soloNumeros],app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css',
    '../../assets/vendors/mdi/css/materialdesignicons.min.css',
    '../../assets/vendors/css/vendor.bundle.base.css',
    '../../assets/vendors/jvectormap/jquery-jvectormap.css',
    '../../assets/vendors/owl-carousel-2/owl.carousel.min.css',
    '../../assets/vendors/owl-carousel-2/owl.theme.default.min.css'
  ],
})

export class productosComponent {

  username: string | undefined | null;
  productos: FormGroup;
  productosUpdate: FormGroup;
  deletedproductos: FormGroup;
  data: Respuestas | undefined | null;
  validationErrors: any;

  codigo: string | undefined | null;
  nombreProducto: string | undefined | null;
  estado: string | undefined | null;
  fechaRegistro: string | undefined | null;
  precio: string | undefined | null;
  costo: string | undefined | null;

  datos: consultarProductos[] = [];
  filteredData: consultarProductos[] = [];
  selectedItem: consultarProductos | null = null;
  searchTerm: string = '';
  pageSize: number = 5;
  pageIndex: number = 0;
  datosproductos: consultarProductos | null | undefined;
  datosproductosDeleted: deletedProductos | null | undefined;

  selectedOption: string = '';

  opciones = [
    { valor: 'Activo', texto: 'Activo' },
    { valor: 'Inactivo', texto: 'Inactivo' }
  ];

  constructor(private authService: AuthService, private router: Router, private fb: FormBuilder, private http: HttpClient, private el: ElementRef) {
    this.username = this.authService.getUsername()?.toUpperCase();
    this.productos = this.fb.group({
      codigo: [''],
      nombreProducto: [''],
      precio: [''],
      costo: [''],
      estado: ['Activo'],
    });

    this.productosUpdate = this.fb.group({
      codigo: [''],
      nombreProducto: [''],
      precio: ['0'],
      costo: ['0'],
      estado: ['Activo'],
    });

    this.deletedproductos = this.fb.group({
      codigo: [''],
    });

  }

  enviarData() {
    const formData = this.productos.value;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json' // Asegúrate de que esto coincida con lo que el servidor espera
    });
    this.http.post<Respuestas>('http://localhost:5013/api/productos/RegistrarProductos', formData, { headers }).subscribe(
      (response) => {
        this.data = response;
        this.validateResponse(this.data);
        this.fetchData();
      }, error => {
        console.error('Error al enviar datos:', error);
      });
  }

  enviarDataDeleted() {
    const formData = this.deletedproductos.value;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json' // Asegúrate de que esto coincida con lo que el servidor espera
    });
    this.http.post<Respuestas>('http://localhost:5013/api/productos/Eliminarproductos', formData, { headers }).subscribe(
      (response) => {
        this.data = response;
        this.validateResponseDeleted(this.data);
        this.fetchData();
        this.ejecutarConEsperaDeleted()
      }, error => {
        console.error('Error al enviar datos:', error);
      });
  }

  enviarDataUpdate() {
    const formData = this.productosUpdate.value;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json' // Asegúrate de que esto coincida con lo que el servidor espera
    });
    this.http.post<Respuestas>('http://localhost:5013/api/Productos/ActualizarProductos', formData, { headers }).subscribe(
      (response) => {
        this.data = response;
        this.validateResponseUpdate(this.data);
        this.fetchData();
        this.ejecutarConEspera()
      }, error => {
        console.error('Error al enviar datos:', error);
      });
  }

  ngOnInit() {
    this.fetchData();
    this.checkSession();
    window.onpopstate = () => this.checkSession();
    if (this.username === undefined || this.username === "" || this.username === null) {
      this.router.navigate(['/login']);
    }
  }

  onSearch() {
    this.filteredData = this.datos.filter(item =>
      item.codigo.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.pageIndex = 0;
  }

  selectItem(item: consultarProductos) {
    this.selectedItem = item;
  }

  fetchData() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json' // Asegúrate de que esto coincida con lo que el servidor espera
    });
    this.http.post<consultarProductos[]>('http://localhost:5013/api/Productos/ConsultarAllProductos', null, { headers })
      .subscribe(data => {
        this.datos = data;
        this.filteredData = data; // Inicialmente mostramos todos los datos
      });
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }


  isModalOpen = false;
  isModalOpenUpdate = false;
  isModalOpenDeleted = false;

  openModal() {
    this.isModalOpen = true;
  }

  openModalUpdate(item: consultarProductos) {
    this.datosproductos = item;    
    this.codigo = this.datosproductos.codigo;
    this.nombreProducto = this.datosproductos.nombreProducto;
    this.estado = this.datosproductos.estado;
    this.fechaRegistro = this.datosproductos.fechaRegistro;
    this.precio = this.datosproductos.precio;
    this.costo = this.datosproductos.costo;
    console.log(this.codigo);
    this.isModalOpenUpdate = true;
  }
  openModalDeleted(item: deletedProductos) {
    this.datosproductosDeleted = item;
    this.codigo = this.datosproductosDeleted.codigo;
    this.isModalOpenDeleted = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.data = null;
    this.limpiar();
  }

  closeModalUpdate() {
    this.isModalOpenUpdate = false;
    this.data = null;
    this.limpiar();
  }

  closeModalDeleted() {
    this.isModalOpenDeleted = false;
    this.data = null;
    this.limpiarDeleted();
  }

  limpiar() {
    this.productos = this.fb.group({
      codigo: [''],
      nombreProducto: [''],
      precio: ['0'],
      costo: ['0'],
      estado: ['Activo'],
    });
  }

  limpiarUpdate() {
    this.productosUpdate = this.fb.group({
      codigo: [''],
      nombreProducto: [''],
      precio: ['0'],
      costo: ['0'],
      estado: ['Activo'],
    });
  }

  limpiarDeleted() {
    this.deletedproductos = this.fb.group({
      codigo: [''],
    });
  }

  validateResponse(datosValidar: any) {
    this.validationErrors = [];
    if (datosValidar.statusCode == 200) {
      this.limpiar();
    }
  }

  validateResponseUpdate(datosValidar: any) {
    this.validationErrors = [];
    if (datosValidar.statusCode == 200) {
      this.limpiarUpdate();
    }
  }

  validateResponseDeleted(datosValidar: any) {
    this.validationErrors = [];
    if (datosValidar.statusCode == 200) {
      this.limpiarDeleted();
    }
  }

  checkSession() {
    if (!this.authService.checkAuth()) {
      sessionStorage.removeItem('username');
      this.router.navigate(['/dashboard']);
    }
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const keyCode = event.keyCode || event.which;
    const isNumber = keyCode >= 48 && keyCode <= 57; // Números del 0 al 9
    //const isNumber2 = keyCode >= 96 && keyCode <= 105; // Números del 0 al 9
    const isControl = keyCode === 8 || keyCode === 46 || keyCode === 37 || keyCode === 39; // Backspace, Delete, flechas
    if (!isNumber && !isControl) {
      event.preventDefault();
    }
  }

 
  get paginatedData() {
    const start = this.pageIndex * this.pageSize;
    return this.filteredData.slice(start, start + this.pageSize);
  }

  sleep(seconds: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, seconds * 1000); // Convertir a milisegundos
    });
  }

  async ejecutarConEspera() {
    await this.sleep(1);
    this.closeModalUpdate();
  }

  async ejecutarConEsperaDeleted() {
    await this.sleep(1);
    this.closeModalDeleted();
  }

  validateDecimal(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const currentValue = input.value;
    const key = event.key;

    // Permitir teclas de control y navegación
    const controlKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter', 'Escape'];
    if (controlKeys.includes(key)) {
      return;
    }

    // Expresión regular para validar un número con un punto decimal y hasta dos decimales
    const regex = /^\d*(\.\d{0,2})?$/;

    // Crear un nuevo valor tentativo
    let newValue = currentValue;

    if (key === '.' && currentValue.includes('.')) {
      // Si ya hay un punto, no permitir otro
      event.preventDefault();
      return;
    }

    newValue += key;

    if (!regex.test(newValue)) {
      // Si no coincide con la expresión regular, prevenir el ingreso
      event.preventDefault();
    }
  }

  validateNumber(event: KeyboardEvent): void {
    const key = event.key;

    // Permitir teclas de control y navegación
    const controlKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter', 'Escape'];
    if (controlKeys.includes(key)) {
      return;
    }

    // Validar que solo se permita el ingreso de números
    if (!/^\d$/.test(key)) {
      event.preventDefault();
    }


  }

  logOut() {
    sessionStorage.removeItem('username');
    this.router.navigate(['/login']);
  }

}
