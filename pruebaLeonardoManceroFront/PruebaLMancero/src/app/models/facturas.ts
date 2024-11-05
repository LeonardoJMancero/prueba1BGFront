export interface Producto {
  codigo: string;
  nombreProducto: string;
  estado: string;
  fechaRegistro: string;
  precio: string;
  costo: string;
  cantidad: string;
}

export interface Pedido {
  username: string | undefined | null;
  identificacion: string | undefined | null;
  productos: Producto[];  // Array de productos seleccionados
}
export interface consultarFacturas {
  username: string;
  identificacion: string;
  nombres: string | undefined | null;
  idFactura: string;
  fechaRegistro: string | undefined | null;
  total: string;
}


