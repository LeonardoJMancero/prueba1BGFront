import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../auth.service';

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
  constructor(private authService: AuthService, private router: Router) {
    this.username = this.authService.getUsername()?.toUpperCase();    
  }

  ngOnInit() {    
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


}
