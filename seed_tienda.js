// seed_tienda.js
// Crea la base "tienda_online" con 3 colecciones y datos de prueba:
//   clientes (25), productos (30), pedidos (120)  ->  175 documentos
//
// Uso (mongosh):
//   mongosh "mongodb://localhost:27017" seed_tienda.js
// o dentro de mongosh:
//   load("seed_tienda.js")
//
// Es seguro volver a ejecutarlo: borra las colecciones y las recrea.

const tienda = db.getSiblingDB("tienda_online");
["clientes", "productos", "pedidos"].forEach((c) => tienda[c].drop());

// ---------- Generador pseudoaleatorio con semilla fija (datos repetibles) ----------
let semilla = 42;
function rnd() {
  semilla = (semilla * 1664525 + 1013904223) % 4294967296;
  return semilla / 4294967296;
}
function entero(min, max) {
  return Math.floor(rnd() * (max - min + 1)) + min;
}
function elegir(arr) {
  return arr[Math.floor(rnd() * arr.length)];
}

// ---------- CLIENTES ----------
const ciudades = ["Bogotá", "Medellín", "Cali", "Barranquilla", "Bucaramanga", "Cartagena", "Pereira"];
const nombres = ["Juan", "Maria", "Carlos", "Laura", "Andres", "Camila", "Sofia", "Daniel", "Valentina", "Felipe"];
const apellidos = ["Gomez", "Rodriguez", "Martinez", "Lopez", "Perez", "Torres", "Ramirez", "Castro", "Vargas", "Rojas"];

const clientes = [];
for (let i = 0; i < 25; i++) {
  const n = nombres[i % nombres.length];
  const a = apellidos[(i * 3) % apellidos.length];
  clientes.push({
    nombre: `${n} ${a}`,
    email: `${n}.${a}${i}@correo.com`.toLowerCase(),
    ciudad: elegir(ciudades),
    fecha_registro: new Date(2025, entero(0, 11), entero(1, 28)),
  });
}
const resClientes = tienda.clientes.insertMany(clientes);
const idsClientes = Object.values(resClientes.insertedIds);

// ---------- PRODUCTOS (atributos variables según la categoría) ----------
const catalogo = [
  // Tecnología
  { nombre: "Portátil Lenovo IdeaPad", categoria: "Tecnología", precio: 2300000, atributos: { ram_gb: 16, almacenamiento_gb: 512, pantalla_pulgadas: 15.6 } },
  { nombre: "Portátil HP Pavilion", categoria: "Tecnología", precio: 2800000, atributos: { ram_gb: 16, almacenamiento_gb: 1024, pantalla_pulgadas: 14 } },
  { nombre: "Smartphone Samsung A15", categoria: "Tecnología", precio: 850000, atributos: { ram_gb: 6, almacenamiento_gb: 128, pantalla_pulgadas: 6.5 } },
  { nombre: "Smartphone Xiaomi Redmi 13", categoria: "Tecnología", precio: 720000, atributos: { ram_gb: 8, almacenamiento_gb: 256, pantalla_pulgadas: 6.7 } },
  { nombre: "Audífonos Bluetooth JBL", categoria: "Tecnología", precio: 190000, atributos: { autonomia_horas: 40, cancelacion_ruido: false } },
  { nombre: "Monitor LG 24 pulgadas", categoria: "Tecnología", precio: 560000, atributos: { pantalla_pulgadas: 24, frecuencia_hz: 75 } },
  { nombre: "Teclado mecánico Redragon", categoria: "Tecnología", precio: 210000, atributos: { switch: "rojo", retroiluminado: true } },
  { nombre: "Mouse inalámbrico Logitech", categoria: "Tecnología", precio: 95000, atributos: { dpi: 1600, bateria_meses: 12 } },
  // Hogar
  { nombre: "Licuadora Oster", categoria: "Hogar", precio: 180000, atributos: { potencia_w: 600, capacidad_litros: 1.5 } },
  { nombre: "Freidora de aire Ninja", categoria: "Hogar", precio: 420000, atributos: { potencia_w: 1500, capacidad_litros: 4 } },
  { nombre: "Juego de sábanas queen", categoria: "Hogar", precio: 130000, atributos: { material: "algodón", tamano: "queen" } },
  { nombre: "Lámpara de escritorio LED", categoria: "Hogar", precio: 75000, atributos: { potencia_w: 10, temperatura_color: "cálida" } },
  { nombre: "Set de ollas antiadherentes", categoria: "Hogar", precio: 260000, atributos: { piezas: 7, material: "aluminio" } },
  { nombre: "Aspiradora robot", categoria: "Hogar", precio: 890000, atributos: { autonomia_min: 120, mapeo: true } },
  { nombre: "Cafetera de goteo", categoria: "Hogar", precio: 150000, atributos: { potencia_w: 800, capacidad_tazas: 12 } },
  // Ropa
  { nombre: "Camiseta básica algodón", categoria: "Ropa", precio: 45000, atributos: { tallas: ["S", "M", "L", "XL"], color: "blanco" } },
  { nombre: "Jean slim fit", categoria: "Ropa", precio: 130000, atributos: { tallas: ["28", "30", "32", "34"], color: "azul" } },
  { nombre: "Chaqueta impermeable", categoria: "Ropa", precio: 210000, atributos: { tallas: ["M", "L", "XL"], color: "negro" } },
  { nombre: "Buzo con capucha", categoria: "Ropa", precio: 95000, atributos: { tallas: ["S", "M", "L"], color: "gris" } },
  { nombre: "Zapatillas urbanas", categoria: "Ropa", precio: 240000, atributos: { tallas: ["38", "40", "42"], color: "blanco" } },
  { nombre: "Vestido casual", categoria: "Ropa", precio: 110000, atributos: { tallas: ["S", "M", "L"], color: "rojo" } },
  { nombre: "Medias deportivas x3", categoria: "Ropa", precio: 30000, atributos: { tallas: ["unica"], color: "negro" } },
  { nombre: "Gorra ajustable", categoria: "Ropa", precio: 40000, atributos: { tallas: ["unica"], color: "azul" } },
  // Deportes
  { nombre: "Balón de fútbol profesional", categoria: "Deportes", precio: 120000, atributos: { talla: 5, material: "cuero sintético" } },
  { nombre: "Bicicleta de montaña rin 29", categoria: "Deportes", precio: 1450000, atributos: { velocidades: 21, material_cuadro: "aluminio" } },
  { nombre: "Mancuernas ajustables 20kg", categoria: "Deportes", precio: 280000, atributos: { peso_kg: 20, material: "hierro" } },
  { nombre: "Tapete de yoga", categoria: "Deportes", precio: 65000, atributos: { grosor_mm: 6, material: "TPE" } },
  { nombre: "Guantes de gimnasio", categoria: "Deportes", precio: 55000, atributos: { tallas: ["S", "M", "L"] } },
  { nombre: "Botella térmica 1L", categoria: "Deportes", precio: 85000, atributos: { capacidad_litros: 1, mantiene_frio_horas: 24 } },
  { nombre: "Reloj deportivo con GPS", categoria: "Deportes", precio: 680000, atributos: { gps: true, autonomia_dias: 10 } },
];

const prefijo = { "Tecnología": "TEC", "Hogar": "HOG", "Ropa": "ROP", "Deportes": "DEP" };
const etiquetasPorCategoria = {
  "Tecnología": ["electrónica", "novedad"],
  "Hogar": ["casa", "cocina"],
  "Ropa": ["moda", "temporada"],
  "Deportes": ["fitness", "aire libre"],
};

const productos = catalogo.map((p, i) => ({
  sku: `${prefijo[p.categoria]}-${String(i + 1).padStart(3, "0")}`,
  nombre: p.nombre,
  categoria: p.categoria,
  precio: p.precio,
  stock: entero(5, 80),
  atributos: p.atributos,
  etiquetas: etiquetasPorCategoria[p.categoria],
}));
const resProductos = tienda.productos.insertMany(productos);
const idsProductos = Object.values(resProductos.insertedIds);

// ---------- PEDIDOS (items embebidos dentro de cada pedido) ----------
const estados = ["entregado", "entregado", "entregado", "enviado", "pendiente", "cancelado"];
const metodos = ["tarjeta", "PSE", "contraentrega", "Nequi"];

const pedidos = [];
for (let i = 0; i < 120; i++) {
  const nItems = entero(1, 4);
  const usados = new Set();
  const items = [];
  let total = 0;
  while (items.length < nItems) {
    const idx = entero(0, productos.length - 1);
    if (usados.has(idx)) continue;
    usados.add(idx);
    const p = productos[idx];
    const cantidad = entero(1, 3);
    items.push({
      producto_id: idsProductos[idx],
      sku: p.sku,
      nombre: p.nombre,
      categoria: p.categoria,
      cantidad: cantidad,
      precio_unitario: p.precio,
    });
    total += cantidad * p.precio;
  }
  pedidos.push({
    cliente_id: elegir(idsClientes),
    fecha: new Date(2026, entero(0, 10), entero(1, 28)),
    estado: elegir(estados),
    metodo_pago: elegir(metodos),
    items: items,
    total: total,
  });
}
tienda.pedidos.insertMany(pedidos);

// ---------- Índices útiles ----------
tienda.productos.createIndex({ sku: 1 }, { unique: true });
tienda.clientes.createIndex({ email: 1 }, { unique: true });
tienda.pedidos.createIndex({ cliente_id: 1, fecha: -1 });

print("Base de datos tienda_online creada:");
print("  clientes : " + tienda.clientes.countDocuments());
print("  productos: " + tienda.productos.countDocuments());
print("  pedidos  : " + tienda.pedidos.countDocuments());
