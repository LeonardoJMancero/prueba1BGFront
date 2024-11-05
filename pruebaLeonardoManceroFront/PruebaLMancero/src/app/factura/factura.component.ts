import { Component, ElementRef, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { consultarClientes } from '../models/consultarClientes';
import { PageEvent } from '@angular/material/paginator';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Respuestas } from '../models/model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { consultarProductos } from '../models/consultarProductos';
import { Producto,Pedido } from '../models/facturas';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-factura',
  templateUrl: './factura.component.html',
  styleUrls: ['./factura.component.css',
    '../../assets/vendors/mdi/css/materialdesignicons.min.css',
    '../../assets/vendors/css/vendor.bundle.base.css',
    '../../assets/vendors/jvectormap/jquery-jvectormap.css',
    '../../assets/vendors/owl-carousel-2/owl.carousel.min.css',
    '../../assets/vendors/owl-carousel-2/owl.theme.default.min.css'
    ]
})
export class FacturaComponent implements OnInit {
  username: string | undefined | null;
  filteredData: consultarClientes[] = [];
  datos: consultarClientes[] = [];
  filteredDataFac: consultarProductos[] = [];
  datosFac: consultarProductos[] = [];
  selectedItem: consultarClientes | null = null;
  selectedItemProd: consultarProductos | null = null;
  searchTerm: string = '';
  pageSize: number = 3;
  pageIndex: number = 0;
  data: Respuestas | undefined | null;
  clientesFac: FormGroup;
  datosClientesFac: consultarClientes | null | undefined;
  nombres: string | undefined | null;
  direccion: string | undefined | null;
  telefono: string | undefined | null;
  identificacion: string | undefined;
  email: string | undefined | null;
  dataFac: Pedido | undefined | null;
  productosSeleccionados: Producto[] = []; // Lista de productos seleccionados
  pedido: Pedido = {
    username: '',  // ID del cliente, puedes modificarlo o hacerlo dinámico
    identificacion: new Date().toISOString(), // Fecha del pedido
    productos: []  // Inicialmente vacío
  };

  apiurl: string='';

  constructor(private authService: AuthService, private router: Router, private fb: FormBuilder,
    private http: HttpClient, private el: ElementRef) {
    this.username = this.authService.getUsername()?.toUpperCase();
    this.apiurl='http://localhost:5013/api/Factura/RegistrarFacturas';
    this.clientesFac = this.fb.group({
      nombres: [''],
      identificacion: [''],
      direccion: [''],
      telefono: [''],
      email: [''],
    });
  }

  isModalOpen = false;
  isModalOpenOK = false;

  ngOnInit() {
    this.fetchData();
    this.fetchDataFac();
    this.checkSession();
    window.onpopstate = () => this.checkSession();

    if (this.username === undefined || this.username === "" || this.username === null) {
      this.router.navigate(['/login']);
    }

  }

  checkSession() {
    if (!this.authService.checkAuth()) {
      sessionStorage.removeItem('username');
      this.router.navigate(['/login']);
    }
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.data = null;
  }


  openModalOK() {
    this.isModalOpenOK = true;
  }

  closeModalOK() {
    this.isModalOpenOK = false;
    this.data = null;
  }

  modalClientes(item: consultarClientes) {
    this.datosClientesFac = item;
    this.nombres = this.datosClientesFac.nombre;
    this.identificacion = this.datosClientesFac.identificacion;
    this.direccion = this.datosClientesFac.direccion;
    this.telefono = this.datosClientesFac.telefono;
    this.email = this.datosClientesFac.email;
    
    this.closeModal();
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

  selectItemFac(item: consultarProductos) {
    this.selectedItemProd = item;
    this.selectedItemProd.cantidad = "1";
    if (!this.productosSeleccionados.some(p => p.codigo === item.codigo)) {
      this.productosSeleccionados.push(item);
    }
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }

  get paginatedData() {
    const start = this.pageIndex * this.pageSize;
    return this.filteredData.slice(start, start + this.pageSize);
  }

  get paginatedDataFac() {
    const start = this.pageIndex * this.pageSize;
    return this.filteredDataFac.slice(start, start + this.pageSize);
  }

  fetchData() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json' // Asegúrate de que esto coincida con lo que el servidor espera
    });
    this.http.post<consultarClientes[]>('http://localhost:5013/api/Clientes/ConsultarAllClientes', null, { headers })
      .subscribe(data => {
        this.datos = data;
        this.filteredData = data; // Inicialmente mostramos todos los datos
      });
  }

  onSearchFac() {
    this.filteredDataFac = this.datosFac.filter(item =>
      item.nombreProducto.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.pageIndex = 0;
  }

  fetchDataFac() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json' // Asegúrate de que esto coincida con lo que el servidor espera
    });
    this.http.post<consultarProductos[]>('http://localhost:5013/api/Productos/ConsultarAllProductos', null, { headers })
      .subscribe(data => {
        this.datosFac = data;
        this.filteredDataFac = data; // Inicialmente mostramos todos los datos
        this.filteredDataFac = this.filteredDataFac.filter(x=>x.estado == "Activo")

      });
  }

  sendJsonData(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post<any>(this.apiurl, data, { headers });
  }


  actualizarPedido(): void {
    this.pedido.productos = [...this.productosSeleccionados];
    this.pedido.identificacion = this.identificacion;
    this.pedido.username = this.username;
   

    const formData = this.pedido;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json' // Asegúrate de que esto coincida con lo que el servidor espera
    });


    const pedidoJson = JSON.stringify(formData);

    this.sendJsonData(pedidoJson).subscribe(response => {
      console.log('Respuesta del servidor:', response);
    }, error => {
      console.error('Error en la solicitud:', error);
    });
    this.productosSeleccionados = [];
    this.openModalOK();
    this.ejecutarConEspera();
  }


  quitarProductoSeleccionado(producto: Producto): void {
    this.productosSeleccionados = this.productosSeleccionados.filter(p => p.codigo !== producto.codigo);
  }

  parsearNumero(campo: string): number {
    const numero = parseFloat(campo);
    return isNaN((numero)) ? 0 : (numero); 
  }

  // Método para sumar los dos campos de cada objeto
  obtenerSuma(campo1: string, campo2: string ): number {
    return this.parsearNumero(campo1) * this.parsearNumero(campo2);
  }

  onEdit(index: number): void {
     this.productosSeleccionados[index].cantidad;
  }

  isFieldValid(): boolean | undefined | '' {
    return this.identificacion && this.identificacion.trim() !== undefined;
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
    this.closeModalOK();
  }


  limpiar() {
    this.clientesFac = this.fb.group({
      nombres: [''],
      identificacion: [''],
      direccion: [''],
      telefono: [''],
      email: [''],
    });
  }

  logOut() {
    sessionStorage.removeItem('username');
    this.router.navigate(['/login']);
  }

}
