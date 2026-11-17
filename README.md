# Tarea 4 - Almacenamiento y consultas de datos en Big Data

Caso de uso: tienda en línea con MongoDB (Atlas).
Curso: Big Data (202016911), UNAD.
Autor: Andres David AIslant Leon

## Archivos
- `seed_tienda.js`: crea la base `tienda_online` con 3 colecciones
  (clientes, productos, pedidos) y 175 documentos de prueba.
- `consultas_tienda.js`: consultas CRUD, filtros y operadores,
  join con `$lookup` y agregaciones (contar, sumar, promediar).

## Cómo ejecutarlo
mongosh "TU_CADENA_DE_CONEXION" --file seed_tienda.js
