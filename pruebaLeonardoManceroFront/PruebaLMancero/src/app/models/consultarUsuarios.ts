export interface consultarUsuarios {
  nombres: string;
  apellidos: string;
  usuario: string;
  email: string;
  password: string;
  confirmacionPassword: string;
  estado: string;
}

export interface deletedUsuarios {
  usuario: string;
}
