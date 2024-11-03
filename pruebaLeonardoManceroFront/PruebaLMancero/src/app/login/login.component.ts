import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Respuestas } from '../models/model';
import { NavigationEnd, Router } from '@angular/router';
import { Location } from '@angular/common';
import { filter } from 'rxjs/operators';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage: string | null = null;

  data: Respuestas[] = []; // Variable para almacenar la respuesta
  validationErrors: any;
  constructor(
    private authService: AuthService,
    private router: Router,
    private location: Location,
    ) {

  }

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        //console.log('Navegación exitosa a:', event.url);        
        // Aquí puedes manejar la lógica que deseas ejecutar al cambiar de ruta
      });

    // Detectar el evento de "back" o "forward"
    window.addEventListener('popstate', (event) => {
      console.log('Navegación hacia atrás o adelante detectada');

      this.logout();
      //this.router.navigate(['/login']);
      // Aquí puedes manejar la lógica adicional si es necesario
    });

    this.login();
    
  }

  onSubmit() {
    this.authService.login(this.username, this.password).subscribe(
      (response) => {
        this.data = response; // Captura la respuesta deserializada
        this.validateResponse(response);
        sessionStorage.setItem('username', this.username);
      },
      (error) => {
        this.errorMessage = 'Credenciales incorrectas';
        console.error('Error en el login', error);
      }
    );
  }

  validateResponse(datos: any) {
    this.validationErrors = [];

    if (!Array.isArray(datos)) {
      this.validationErrors.push('La respuesta no es un arreglo');
      return;
    }

    datos.forEach((user: any) => {
      if (user.statusCode == 200 ) {        
        this.router.navigate(['/dashboard']);
      }
    });

    if (this.validationErrors.length === 0) {
      this.data = datos; // Solo asigna si no hay errores
    }
  }

  

  login() {
    this.authService.log();
    // Redirigir al usuario a la página principal después de iniciar sesión
  }

  logout() {
    this.authService.logout();
    // Redirigir al usuario a la página principal después de iniciar sesión
  }

}
