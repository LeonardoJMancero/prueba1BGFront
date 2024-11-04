import { Component, Directive, ElementRef, HostListener } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Respuestas } from '../models/model';
import { consultarClientes, deletedClientes } from '../models/consultarClientes';
import { PageEvent } from '@angular/material/paginator';



@Component({
  selector: '[soloNumeros],app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css',
    '../../assets/vendors/mdi/css/materialdesignicons.min.css',
    '../../assets/vendors/css/vendor.bundle.base.css',
    '../../assets/vendors/jvectormap/jquery-jvectormap.css',
    '../../assets/vendors/owl-carousel-2/owl.carousel.min.css',
    '../../assets/vendors/owl-carousel-2/owl.theme.default.min.css'
  ],
})

export class ClientesComponent {

  username: string | undefined | null;
  clientes: FormGroup;
  clientesUpdate: FormGroup;
  deletedClientes: FormGroup;
  data: Respuestas | undefined | null;
  validationErrors: any;

  nombres: string | undefined | null;
  direccion: string | undefined | null;
  telefono: string | undefined | null;
  identificacion: string | undefined | null;
  email: string | undefined | null;

  datos: consultarClientes[] = [];
  filteredData: consultarClientes[] = [];
  selectedItem: consultarClientes | null = null;
  searchTerm: string = '';
  pageSize: number = 5;
  pageIndex: number = 0;
  datosClientes: consultarClientes | null | undefined;
  datosClientesDeleted: deletedClientes | null | undefined;

  selectedOption: string = '';

  opciones = [
    { valor: 'Activo', texto: 'Activo' },
    { valor: 'Inactivo', texto: 'Inactivo' }
  ];

  constructor(private authService: AuthService, private router: Router, private fb: FormBuilder, private http: HttpClient, private el: ElementRef) {
    this.username = this.authService.getUsername()?.toUpperCase();
    this.clientes = this.fb.group({
      nombres: [''],
      identificacion: [''],
      direccion: [''],
      telefono: [''],
      email: [''],
    });

    this.clientesUpdate = this.fb.group({
      nombres: [''],
      identificacion: [''],
      direccion: [''],
      telefono: [''],
      email: [''],
      estado: ['Activo']
    });

    this.deletedClientes = this.fb.group({
      identificacion: [''],
    });
    
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

  enviarData() {
    const formData = this.clientes.value;    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json' // Asegúrate de que esto coincida con lo que el servidor espera
    });
    this.http.post<Respuestas>('http://localhost:5013/api/Clientes/RegistrarClientes', formData, { headers }).subscribe(
      (response) => {
        this.data = response;
        this.validateResponse(this.data);
        this.fetchData();
      }, error => {
        console.error('Error al enviar datos:', error);
      });
  }

  enviarDataDeleted() {
    const formData = this.deletedClientes.value;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json' // Asegúrate de que esto coincida con lo que el servidor espera
    });
    this.http.post<Respuestas>('http://localhost:5013/api/Clientes/EliminarClientes', formData, { headers }).subscribe(
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
    const formData = this.clientesUpdate.value;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json' // Asegúrate de que esto coincida con lo que el servidor espera
    });
    this.http.post<Respuestas>('http://localhost:5013/api/Clientes/ModificarClientes', formData, { headers }).subscribe(
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

  checkSession() {
    if (!this.authService.checkAuth()) {
      sessionStorage.removeItem('username');
      this.router.navigate(['/dashboard']);
    }
  }

  isModalOpen = false;
  isModalOpenUpdate = false;
  isModalOpenDeleted = false;

  openModal() {
    this.isModalOpen = true;
  }

  openModalUpdate(item: consultarClientes) {
    this.datosClientes = item;
    this.nombres = this.datosClientes.nombre;    
    this.identificacion = this.datosClientes.identificacion;    
    this.direccion = this.datosClientes.direccion;    
    this.telefono = this.datosClientes.telefono;    
    this.email = this.datosClientes.email;    
    this.isModalOpenUpdate = true;
    
  }
  openModalDeleted(item: deletedClientes) {
    this.datosClientesDeleted = item;
    this.identificacion = this.datosClientesDeleted.identificacion;
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
    this.clientes = this.fb.group({
      nombres: [''],
      identificacion: [''],
      direccion: [''],
      telefono: [''],
      email: [''],
    });
  }

  limpiarUpdate() {
    this.clientesUpdate = this.fb.group({
      nombres: [''],
      identificacion: [''],
      direccion: [''],
      telefono: [''],
      email: [''],
      estado: ['Activo']
    });
  }
  
  limpiarDeleted() {
    this.deletedClientes = this.fb.group({
      identificacion: [''],
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

  onSearch() {
    this.filteredData = this.datos.filter(item =>
      item.identificacion.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.pageIndex = 0;
  }

  selectItem(item: consultarClientes) {
    this.selectedItem = item;    
  }

  fetchData() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json' // Asegúrate de que esto coincida con lo que el servidor espera
    });
    this.http.post<consultarClientes[]>('http://localhost:5013/api/Clientes/ConsultarAllClientes', null, {headers})
      .subscribe(data => {
        this.datos = data;
        this.filteredData = data; // Inicialmente mostramos todos los datos
      });
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
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


}
