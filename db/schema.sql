DROP TABLE IF EXISTS favoritos;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
  id             SERIAL PRIMARY KEY,
  nombre         VARCHAR(100) NOT NULL,
  email          VARCHAR(150) NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NOT NULL,
  rol            VARCHAR(20)  NOT NULL DEFAULT 'usuario'
                 CHECK (rol IN ('usuario', 'admin')),
  creado_en      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE productos (
  id             SERIAL PRIMARY KEY,
  nombre         VARCHAR(120)  NOT NULL,
  descripcion    TEXT          NOT NULL,
  categoria      VARCHAR(60)   NOT NULL,
  precio         NUMERIC(10,2) NOT NULL CHECK (precio > 0),
  creado_en      TIMESTAMP     NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TABLE favoritos (
  usuario_id   INTEGER   NOT NULL REFERENCES usuarios(id)  ON DELETE CASCADE,
  producto_id  INTEGER   NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  agregado_en  TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (usuario_id, producto_id)
);

CREATE INDEX idx_productos_categoria ON productos (LOWER(categoria));

INSERT INTO productos (nombre, descripcion, categoria, precio) VALUES
  ('Laptop Andina 14',      'Portátil de 14 pulgadas, 16 GB RAM, 512 GB SSD', 'tecnologia', 749.99),
  ('Audífonos Pacífico',    'Audífonos inalámbricos con cancelación de ruido', 'tecnologia', 89.90),
  ('Mochila Chimborazo',    'Mochila impermeable de 30 litros',               'accesorios', 45.50),
  ('Termo Galápagos',       'Termo de acero inoxidable de 750 ml',            'hogar',      18.75),
  ('Lámpara Cotopaxi',      'Lámpara LED de escritorio regulable',            'hogar',      32.00),
  ('Libro Node.js Básico',  'Guía práctica de Node.js y Express',             'libros',     24.99);
