// consultas_tienda.js
// Consultas para la Tarea 4 sobre la base "tienda_online".
// Ejecútalas BLOQUE POR BLOQUE en mongosh (o en la consola de Compass)
// para poder tomar un pantallazo del código y del resultado de cada una.
//
// Antes: haber corrido seed_tienda.js

use("tienda_online");

// =====================================================================
// 1. CONSULTAS BÁSICAS (CRUD)
// =====================================================================

// ---- 1.1 INSERCIÓN ----
db.productos.insertOne({
  sku: "TEC-999",
  nombre: "Cargador USB-C 65W",
  categoria: "Tecnología",
  precio: 110000,
  stock: 40,
  atributos: { potencia_w: 65, puertos: 2 },
  etiquetas: ["electrónica", "novedad"],
});

db.clientes.insertMany([
  { nombre: "Cliente Prueba Uno", email: "prueba1@correo.com", ciudad: "Bogotá", fecha_registro: new Date() },
  { nombre: "Cliente Prueba Dos", email: "prueba2@correo.com", ciudad: "Cali", fecha_registro: new Date() },
]);

// ---- 1.2 SELECCIÓN ----
// Todos los productos de Tecnología con precio menor a 1.000.000, ordenados por precio
db.productos
  .find({ categoria: "Tecnología", precio: { $lt: 1000000 } }, { _id: 0, nombre: 1, precio: 1, stock: 1 })
  .sort({ precio: 1 });

// Un solo cliente
db.clientes.findOne({ ciudad: "Medellín" });

// Los 5 productos más caros
db.productos.find({}, { _id: 0, nombre: 1, categoria: 1, precio: 1 }).sort({ precio: -1 }).limit(5);

// ---- 1.3 ACTUALIZACIÓN ----
// Cambiar el precio de un producto
db.productos.updateOne({ sku: "TEC-999" }, { $set: { precio: 99000 } });

// Sumar 10 unidades de stock a todos los productos de Deportes
db.productos.updateMany({ categoria: "Deportes" }, { $inc: { stock: 10 } });

// Marcar como "enviado" los pedidos pendientes anteriores a marzo de 2026
db.pedidos.updateMany(
  { estado: "pendiente", fecha: { $lt: new Date("2026-03-01") } },
  { $set: { estado: "enviado" } }
);

// Verificar el cambio
db.productos.findOne({ sku: "TEC-999" }, { _id: 0, nombre: 1, precio: 1 });

// ---- 1.4 ELIMINACIÓN ----
db.productos.deleteOne({ sku: "TEC-999" });
db.clientes.deleteMany({ email: { $in: ["prueba1@correo.com", "prueba2@correo.com"] } });

// Verificar
db.productos.countDocuments({ sku: "TEC-999" }); // debe dar 0

// =====================================================================
// 2. CONSULTAS CON FILTROS Y OPERADORES
// =====================================================================

// ---- 2.1 $and / $or / $gte / $in ----
// Pedidos entregados o enviados con total de al menos 2.000.000
db.pedidos.find(
  {
    $and: [
      { estado: { $in: ["entregado", "enviado"] } },
      { total: { $gte: 2000000 } },
    ],
  },
  { _id: 0, fecha: 1, estado: 1, metodo_pago: 1, total: 1 }
).sort({ total: -1 });

// ---- 2.2 Expresión regular ----
// Productos cuyo nombre contiene "Smartphone" (sin distinguir mayúsculas)
db.productos.find({ nombre: /smartphone/i }, { _id: 0, nombre: 1, precio: 1 });

// ---- 2.3 Búsqueda en arreglos y documentos anidados ----
// Productos con etiqueta "cocina"
db.productos.find({ etiquetas: "cocina" }, { _id: 0, nombre: 1, etiquetas: 1 });

// Portátiles/smartphones con 16 GB de RAM o más (campo dentro del documento "atributos")
db.productos.find({ "atributos.ram_gb": { $gte: 16 } }, { _id: 0, nombre: 1, "atributos.ram_gb": 1 });

// Pedidos que contienen un ítem de la categoría Ropa con cantidad >= 3 ($elemMatch)
db.pedidos.find(
  { items: { $elemMatch: { categoria: "Ropa", cantidad: { $gte: 3 } } } },
  { _id: 0, fecha: 1, estado: 1, total: 1 }
);

// ---- 2.4 JOIN con $lookup: pedidos + datos del cliente ----
db.pedidos.aggregate([
  { $match: { estado: "entregado" } },
  {
    $lookup: {
      from: "clientes",
      localField: "cliente_id",
      foreignField: "_id",
      as: "cliente",
    },
  },
  { $unwind: "$cliente" },
  {
    $project: {
      _id: 0,
      fecha: 1,
      total: 1,
      "cliente.nombre": 1,
      "cliente.ciudad": 1,
    },
  },
  { $sort: { total: -1 } },
  { $limit: 5 },
]);

// ---- 2.5 JOIN con $lookup: ítems del pedido + datos actuales del producto ----
db.pedidos.aggregate([
  { $limit: 3 },
  { $unwind: "$items" },
  {
    $lookup: {
      from: "productos",
      localField: "items.producto_id",
      foreignField: "_id",
      as: "producto",
    },
  },
  { $unwind: "$producto" },
  {
    $project: {
      _id: 0,
      fecha: 1,
      "items.nombre": 1,
      "items.cantidad": 1,
      "producto.stock": 1,
      "producto.precio": 1,
    },
  },
]);

// =====================================================================
// 3. CONSULTAS DE AGREGACIÓN (ESTADÍSTICAS)
// =====================================================================

// ---- 3.1 CONTAR ----
db.pedidos.countDocuments({});
db.pedidos.countDocuments({ estado: "cancelado" });

// Cantidad de pedidos por estado
db.pedidos.aggregate([
  { $group: { _id: "$estado", cantidad_pedidos: { $sum: 1 } } },
  { $sort: { cantidad_pedidos: -1 } },
]);

// ---- 3.2 SUMAR ----
// Total vendido (sin cancelados) por categoría
db.pedidos.aggregate([
  { $match: { estado: { $ne: "cancelado" } } },
  { $unwind: "$items" },
  {
    $group: {
      _id: "$items.categoria",
      unidades_vendidas: { $sum: "$items.cantidad" },
      ingresos: { $sum: { $multiply: ["$items.cantidad", "$items.precio_unitario"] } },
    },
  },
  { $sort: { ingresos: -1 } },
]);

// Ventas totales por mes de 2026 (sin cancelados)
db.pedidos.aggregate([
  { $match: { estado: { $ne: "cancelado" } } },
  { $group: { _id: { mes: { $month: "$fecha" } }, ventas: { $sum: "$total" }, pedidos: { $sum: 1 } } },
  { $sort: { "_id.mes": 1 } },
]);

// ---- 3.3 PROMEDIAR ----
// Ticket promedio general (sin cancelados)
db.pedidos.aggregate([
  { $match: { estado: { $ne: "cancelado" } } },
  { $group: { _id: null, ticket_promedio: { $avg: "$total" }, pedido_maximo: { $max: "$total" }, pedido_minimo: { $min: "$total" } } },
]);

// Precio promedio de los productos por categoría
db.productos.aggregate([
  { $group: { _id: "$categoria", precio_promedio: { $avg: "$precio" }, productos: { $sum: 1 } } },
  { $sort: { precio_promedio: -1 } },
]);

// ---- 3.4 Estadísticas combinadas con $lookup ----
// Gasto total y número de pedidos por ciudad del cliente
db.pedidos.aggregate([
  { $match: { estado: { $ne: "cancelado" } } },
  { $lookup: { from: "clientes", localField: "cliente_id", foreignField: "_id", as: "cliente" } },
  { $unwind: "$cliente" },
  {
    $group: {
      _id: "$cliente.ciudad",
      pedidos: { $sum: 1 },
      gasto_total: { $sum: "$total" },
      ticket_promedio: { $avg: "$total" },
    },
  },
  { $sort: { gasto_total: -1 } },
]);

// Top 5 productos más vendidos (por unidades)
db.pedidos.aggregate([
  { $match: { estado: { $ne: "cancelado" } } },
  { $unwind: "$items" },
  { $group: { _id: "$items.nombre", unidades: { $sum: "$items.cantidad" } } },
  { $sort: { unidades: -1 } },
  { $limit: 5 },
]);
