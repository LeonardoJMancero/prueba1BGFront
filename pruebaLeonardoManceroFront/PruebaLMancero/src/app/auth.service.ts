import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Respuestas } from './models/model';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

 
  private apiUrl = 'http://localhost:5013/api/Usuarios/ConsultarLogin'; // Cambia esto según tu API
  private isAuthenticated = false;
  constructor(private http: HttpClient, private router: Router) { }

  login(usuario: string, password: string): Observable<Respuestas[]> {

    const headers = new HttpHeaders({
      'Content-Type': 'application/json' // Asegúrate de que esto coincida con lo que el servidor espera
    });

    return this.http.post<Respuestas[]>(`${this.apiUrl}`, { usuario, password }, { headers });

  }

  log() {
    this.isAuthenticated = true;
    sessionStorage.setItem('isLoggedIn', 'true');   
  }

  logout() {
    this.isAuthenticated = false;
    sessionStorage.removeItem('isLoggedIn');
    this.router.navigate(['/login']);
  }

  checkAuth() {
    return sessionStorage.getItem('isLoggedIn') === 'true';
  }

  getUsername(): string | null {
    return sessionStorage.getItem('username');
  }
}


