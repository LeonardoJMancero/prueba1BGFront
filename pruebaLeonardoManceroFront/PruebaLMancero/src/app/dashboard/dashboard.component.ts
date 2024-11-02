import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})


export class DashboardComponent implements OnInit {
  username: string | null;
  constructor(private authService: AuthService, private router: Router) {
    this.username = this.authService.getUsername();
    console.log(this.username);
  }

  ngOnInit() {    
    this.checkSession();
    window.onpopstate = () => this.checkSession();
   
  }

  checkSession() {
    if (!this.authService.checkAuth()) {
      sessionStorage.removeItem('username');   
      this.router.navigate(['/login']);
    }
  }


}
