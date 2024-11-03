import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-clientes',
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
  constructor(private authService: AuthService, private router: Router) {
    this.username = this.authService.getUsername()?.toUpperCase();
  }

  ngOnInit() {
    this.checkSession();
    window.onpopstate = () => this.checkSession();

    console.log(this.username);

    if (this.username === undefined || this.username==="" || this.username===null) {
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

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

}
