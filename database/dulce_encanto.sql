CREATE DATABASE IF NOT EXISTS dulce_encanto CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dulce_encanto;

CREATE TABLE categoria (
  id_categoria INT AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(60) NOT NULL UNIQUE, descripcion TEXT, activo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE producto (
  id_producto INT AUTO_INCREMENT PRIMARY KEY, id_categoria INT NOT NULL, codigo VARCHAR(30) NOT NULL UNIQUE, nombre VARCHAR(100) NOT NULL, descripcion TEXT, precio_venta DECIMAL(12,2) NOT NULL CHECK(precio_venta>=0), vida_util_dias INT NOT NULL CHECK(vida_util_dias>0), activo BOOLEAN NOT NULL DEFAULT TRUE, FOREIGN KEY(id_categoria) REFERENCES categoria(id_categoria)
) ENGINE=InnoDB;

CREATE TABLE sucursal (
  id_sucursal INT AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(100) NOT NULL, provincia VARCHAR(20) NOT NULL, canton VARCHAR(60) NOT NULL, direccion VARCHAR(250) NOT NULL, telefono VARCHAR(20) NOT NULL, correo VARCHAR(120), activa BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE inventario (
  id_inventario INT AUTO_INCREMENT PRIMARY KEY, id_producto INT NOT NULL, id_sucursal INT NOT NULL, cantidad_disponible INT NOT NULL DEFAULT 0 CHECK(cantidad_disponible>=0), stock_minimo INT NOT NULL DEFAULT 0 CHECK(stock_minimo>=0), fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, UNIQUE(id_producto,id_sucursal), FOREIGN KEY(id_producto) REFERENCES producto(id_producto), FOREIGN KEY(id_sucursal) REFERENCES sucursal(id_sucursal)
) ENGINE=InnoDB;

CREATE TABLE cliente (
  id_cliente INT AUTO_INCREMENT PRIMARY KEY, tipo_cliente VARCHAR(10) NOT NULL CHECK(tipo_cliente IN ('persona','empresa')), nombre VARCHAR(150) NOT NULL, identificacion VARCHAR(30) UNIQUE, telefono VARCHAR(20), correo VARCHAR(120), direccion VARCHAR(250), fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE metodo_pago (
  id_metodo_pago INT AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(50) NOT NULL UNIQUE, descripcion VARCHAR(200), activo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE empleado (
  id_empleado INT AUTO_INCREMENT PRIMARY KEY, id_sucursal INT, identificacion VARCHAR(30) NOT NULL UNIQUE, nombres VARCHAR(80) NOT NULL, apellidos VARCHAR(100) NOT NULL, telefono VARCHAR(20) NOT NULL, correo VARCHAR(120), cargo VARCHAR(60) NOT NULL, fecha_contratacion DATE NOT NULL, activo BOOLEAN NOT NULL DEFAULT TRUE, FOREIGN KEY(id_sucursal) REFERENCES sucursal(id_sucursal)
) ENGINE=InnoDB;

CREATE TABLE proveedor (
  id_proveedor INT AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(150) NOT NULL, identificacion VARCHAR(30) NOT NULL UNIQUE, nombre_contacto VARCHAR(120), telefono VARCHAR(20) NOT NULL, correo VARCHAR(120), direccion VARCHAR(250) NOT NULL, activo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE ingrediente (
  id_ingrediente INT AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(100) NOT NULL UNIQUE, descripcion TEXT, unidad_medida VARCHAR(10) NOT NULL CHECK(unidad_medida IN ('kg','L','unidad')), activo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE venta (
  id_venta INT AUTO_INCREMENT PRIMARY KEY, id_sucursal INT NOT NULL, id_cliente INT, id_empleado INT NOT NULL, id_metodo_pago INT NOT NULL, fecha_venta DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, total DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK(total>=0), estado VARCHAR(15) NOT NULL DEFAULT 'registrada' CHECK(estado IN ('registrada','anulada')), FOREIGN KEY(id_sucursal) REFERENCES sucursal(id_sucursal), FOREIGN KEY(id_cliente) REFERENCES cliente(id_cliente), FOREIGN KEY(id_empleado) REFERENCES empleado(id_empleado), FOREIGN KEY(id_metodo_pago) REFERENCES metodo_pago(id_metodo_pago)
) ENGINE=InnoDB;

CREATE TABLE detalle_venta (
  id_detalle_venta INT AUTO_INCREMENT PRIMARY KEY, id_venta INT NOT NULL, id_producto INT NOT NULL, cantidad INT NOT NULL CHECK(cantidad>0), precio_unitario DECIMAL(12,2) NOT NULL CHECK(precio_unitario>=0), subtotal DECIMAL(12,2) GENERATED ALWAYS AS (cantidad*precio_unitario) STORED, FOREIGN KEY(id_venta) REFERENCES venta(id_venta), FOREIGN KEY(id_producto) REFERENCES producto(id_producto)
) ENGINE=InnoDB;

CREATE TABLE receta (
  id_receta INT AUTO_INCREMENT PRIMARY KEY, id_producto INT NOT NULL UNIQUE, nombre VARCHAR(100) NOT NULL, instrucciones TEXT NOT NULL, rendimiento_unidades INT NOT NULL CHECK(rendimiento_unidades>0), tiempo_preparacion_minutos INT NOT NULL CHECK(tiempo_preparacion_minutos>0), fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, FOREIGN KEY(id_producto) REFERENCES producto(id_producto)
) ENGINE=InnoDB;

CREATE TABLE detalle_receta (
  id_detalle_receta INT AUTO_INCREMENT PRIMARY KEY, id_receta INT NOT NULL, id_ingrediente INT NOT NULL, cantidad DECIMAL(12,3) NOT NULL CHECK(cantidad>0), observaciones VARCHAR(250), UNIQUE(id_receta,id_ingrediente), FOREIGN KEY(id_receta) REFERENCES receta(id_receta), FOREIGN KEY(id_ingrediente) REFERENCES ingrediente(id_ingrediente)
) ENGINE=InnoDB;

CREATE TABLE orden_compra (
  id_orden_compra INT AUTO_INCREMENT PRIMARY KEY, id_proveedor INT NOT NULL, id_empleado INT NOT NULL, fecha_orden DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, fecha_entrega_estimada DATE, estado VARCHAR(15) NOT NULL DEFAULT 'pendiente' CHECK(estado IN ('pendiente','recibida','cancelada')), total DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK(total>=0), observaciones TEXT, FOREIGN KEY(id_proveedor) REFERENCES proveedor(id_proveedor), FOREIGN KEY(id_empleado) REFERENCES empleado(id_empleado)
) ENGINE=InnoDB;

CREATE TABLE detalle_compra (
  id_detalle_compra INT AUTO_INCREMENT PRIMARY KEY, id_orden_compra INT NOT NULL, id_ingrediente INT NOT NULL, cantidad DECIMAL(12,3) NOT NULL CHECK(cantidad>0), costo_unitario DECIMAL(12,2) NOT NULL CHECK(costo_unitario>=0), subtotal DECIMAL(12,2) GENERATED ALWAYS AS (ROUND(cantidad*costo_unitario,2)) STORED, FOREIGN KEY(id_orden_compra) REFERENCES orden_compra(id_orden_compra), FOREIGN KEY(id_ingrediente) REFERENCES ingrediente(id_ingrediente)
) ENGINE=InnoDB;

-- El backend debe mantener totales en transacciones y exigir al menos un detalle.

