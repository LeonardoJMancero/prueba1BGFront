import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../auth.service';
import { consultarFacturas } from '../models/facturas';
import { PageEvent } from '@angular/material/paginator';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css',
    '../../assets/vendors/mdi/css/materialdesignicons.min.css',
    '../../assets/vendors/css/vendor.bundle.base.css',
    '../../assets/vendors/jvectormap/jquery-jvectormap.css',
    '../../assets/vendors/owl-carousel-2/owl.carousel.min.css',
    '../../assets/vendors/owl-carousel-2/owl.theme.default.min.css'
  ],
})


export class DashboardComponent implements OnInit {
  username: string | undefined | null;
  datos: consultarFacturas[] = [];
  filteredData: consultarFacturas[] = [];
  selectedItem: consultarFacturas | null = null;
  searchTerm: string = '';
  pageSize: number = 5;
  pageIndex: number = 0;
  constructor(private authService: AuthService, private router: Router, private http: HttpClient) {
    this.username = this.authService.getUsername()?.toUpperCase();    
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
      this.router.navigate(['/login']);
    }
  }

  logOut() {
    sessionStorage.removeItem('username');
    this.router.navigate(['/login']);
  }



  onSearch() {
    this.filteredData = this.datos.filter(item =>
      item.identificacion.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    console.log(this.filteredData);
    this.pageIndex = 0;
  }

  selectItem(item: consultarFacturas) {
    this.selectedItem = item;
  }

  fetchData() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json' // Asegúrate de que esto coincida con lo que el servidor espera
    });
    this.http.post<consultarFacturas[]>('http://localhost:5013/api/Factura/ConsultarAllFacturas', null, { headers })
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



}
