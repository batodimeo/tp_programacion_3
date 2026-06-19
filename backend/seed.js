const iniciarDB = require("./database");
const Producto = require("./models/Producto");

const productos = [
  // Juegos
  { nombre: "God of War Ragnarok",       descripcion: "Acción y aventura nórdica",         precio: 29999, categoria: "juegos",      imagen: "../img/God_of_War_ragnarok.png",            activo: true },
  { nombre: "Spider-Man 2",              descripcion: "El hombre araña en PS5",             precio: 32999, categoria: "juegos",      imagen: "../img/Spider_Man_2.png",                  activo: true },
  { nombre: "Hogwarts Legacy",           descripcion: "Mundo mágico de Harry Potter",       precio: 27999, categoria: "juegos",      imagen: "../img/Hogwarts_Legacy.png",               activo: true },
  { nombre: "Elden Ring",                descripcion: "RPG de mundo abierto y dificultad",  precio: 31999, categoria: "juegos",      imagen: "../img/Elden_Ring.png",                    activo: true },
  { nombre: "FIFA 25",                   descripcion: "El fútbol más realista",             precio: 24999, categoria: "juegos",      imagen: "../img/FIFA_25.png",                       activo: true },
  { nombre: "Mortal Kombat 1",           descripcion: "El clásico juego de peleas",         precio: 26999, categoria: "juegos",      imagen: "../img/Mortal_Kombat_1.png",               activo: true },
  { nombre: "Cyberpunk 2077",            descripcion: "RPG futurista en Night City",        precio: 22999, categoria: "juegos",      imagen: "../img/Cyberpunk_2077.png",                activo: true },
  { nombre: "The Last of Us Part I",     descripcion: "Survival thriller post-apocalíptico",precio: 28999, categoria: "juegos",      imagen: "../img/The_Last_of_Us_Part_I.png",         activo: true },
  // Accesorios
  { nombre: "Control PS5 DualSense",     descripcion: "Control inalámbrico para PS5",       precio: 34999, categoria: "accesorios", imagen: "../img/Control_PS5_DualSense.png",          activo: true },
  { nombre: "Auriculares HyperX Cloud",  descripcion: "Sonido envolvente 7.1",              precio: 41999, categoria: "accesorios", imagen: "../img/Auriculares_HyperX_Cloud.png",      activo: true },
  { nombre: "Teclado Mecánico Redragon", descripcion: "Teclado gamer con switches rojos",   precio: 23999, categoria: "accesorios", imagen: "../img/Teclado_Mecanico_Redragon.png",     activo: true },
  { nombre: "Mouse Logitech G502",       descripcion: "Mouse de alta precisión 25K DPI",    precio: 29999, categoria: "accesorios", imagen: "../img/Mouse_Logitech_G502.png",            activo: true },
  { nombre: "Silla Gamer DXRacer",       descripcion: "Ergonómica para largas sesiones",    precio: 89999, categoria: "accesorios", imagen: "../img/Silla_Gamer_DXRacer.png",            activo: true },
  { nombre: "Monitor LG UltraGear",      descripcion: "144Hz, 1ms, Full HD",                precio: 124999,categoria: "accesorios", imagen: "../img/Monitor_LG_UltraGear.png",           activo: true },
  { nombre: "Webcam Logitech C920",      descripcion: "1080p para streaming",               precio: 19999, categoria: "accesorios", imagen: "../img/Webcam_Logitech_C920.png",           activo: true },
  { nombre: "Pad Gamer XL SteelSeries",  descripcion: "Mousepad extra grande antideslizante",precio: 9999, categoria: "accesorios", imagen: "../img/Pad_Gamer_XL_SteelSeries.png",      activo: true },
];

async function cargarProductos() {
  await iniciarDB();

  const cantidad = await Producto.count();
  if (cantidad > 0) {
    console.log("Ya hay productos en la base de datos, no se cargaron duplicados.");
    process.exit();
  }

  await Producto.bulkCreate(productos);
  console.log(`${productos.length} productos cargados correctamente.`);
  process.exit();
}

cargarProductos();
