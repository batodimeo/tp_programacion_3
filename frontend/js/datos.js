const productos = {
  juegos: [
    { id: 1, nombre: "God of War Ragnarök", precio: 12999, descripcion: "Aventura de acción nórdica para PS5", imagen: "../img/God_of_War_ragnarok.png", activo: true },
    { id: 2, nombre: "Hogwarts Legacy", precio: 10999, descripcion: "RPG ambientado en el mundo mágico de Harry Potter", imagen: "../img/Hogwarts_Legacy-.png", activo: true },
    { id: 3, nombre: "Elden Ring", precio: 11499, descripcion: "RPG de mundo abierto de FromSoftware", imagen: "../img/Elden Ring.png", activo: true },
    { id: 4, nombre: "FC 26", precio: 9999, descripcion: "El mejor simulador de fútbol del mundo", imagen: "../img/FC_26.png", activo: true },
    { id: 5, nombre: "Spider-Man 2", precio: 13999, descripcion: "La aventura del hombre araña para PS5", imagen: "../img/Spider-Man_2-.png", activo: true },
    { id: 6, nombre: "Cyberpunk 2077", precio: 8999, descripcion: "RPG futurista en Night City", imagen: "../img/Cyberpunk_2077.png", activo: true },
    { id: 7, nombre: "The Last of Us Part I", precio: 11999, descripcion: "Remake del clásico post-apocalíptico", imagen: "../img/The_last_of_us-.png", activo: true },
    { id: 8, nombre: "Mortal Kombat 11", precio: 10499, descripcion: "El icónico juego de pelea regresa", imagen: "../img/Moral_Kombat_11.png", activo: true },
  ],
  accesorios: [
    { id: 9, nombre: "Teclado Redragon K552", precio: 59999, descripcion: "Teclado mecánico RGB TKL", imagen: "../img/Teclado Redragon k552.png", activo: true },
    { id: 10, nombre: "Mouse Redragon M711", precio: 49999, descripcion: "Mouse gamer 10000 DPI ergonómico", imagen: "../img/Mouse Redragon M711.png", activo: true },
    { id: 11, nombre: "Auriculares Razer BlackShark", precio: 79999, descripcion: "Sonido surround 7.1 con micrófono", imagen: "../img/Auriculares Razer BlackShark.png", activo: true },
    { id: 12, nombre: "Silla Gamer DXRacer", precio: 189999, descripcion: "Silla ergonómica con soporte lumbar", imagen: "../img/Silla_Gamer_DXRacer.png", activo: true },
    { id: 13, nombre: "Monitor LG 24\" 144Hz", precio: 259999, descripcion: "Monitor Full HD con 1ms de respuesta", imagen: "../img/Monitor_LG_24__144Hz.png", activo: true },
    { id: 14, nombre: "Pad XL Redragon", precio: 14999, descripcion: "Mousepad gigante de tela 800x300mm", imagen: "../img/Pad_XL_Redragon-.png", activo: true },
    { id: 15, nombre: "Joystick DualSense PS5", precio: 89999, descripcion: "Control inalámbrico oficial de PS5", imagen: "../img/Joystick_DualSense_PS5.png", activo: true },
    { id: 16, nombre: "Webcam Logitech C920", precio: 69999, descripcion: "Cámara Full HD 1080p para streaming", imagen: "../img/Webcam_Logitech_C920-.png", activo: true },
  ]
};


function obtenerCarrito() {
  return JSON.parse(localStorage.getItem("carrito")) || [];
}

function guardarCarrito(carrito) {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

function agregarAlCarrito(idProducto, categoria) {
  const lista = productos[categoria];
  const producto = lista.find(p => p.id === idProducto);
  if (!producto) return;

  const carrito = obtenerCarrito();
  const existente = carrito.find(i => i.id === idProducto);

  if (existente) {
    existente.cantidad++;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }

  guardarCarrito(carrito);
  actualizarBadge();
  mostrarToast(producto.nombre);
}

function quitarDelCarrito(idProducto) {
  const carrito = obtenerCarrito();
  const existente = carrito.find(i => i.id === idProducto);
  if (!existente) return;

  if (existente.cantidad > 1) {
    existente.cantidad--;
  } else {
    const idx = carrito.findIndex(i => i.id === idProducto);
    carrito.splice(idx, 1);
  }

  guardarCarrito(carrito);
  actualizarBadge();
}

function cantidadEnCarrito(idProducto) {
  const carrito = obtenerCarrito();
  const item = carrito.find(i => i.id === idProducto);
  return item ? item.cantidad : 0;
}

function actualizarBadge() {
  const badge = document.getElementById("carrito-badge");
  if (!badge) return;
  const total = obtenerCarrito().reduce((acc, i) => acc + i.cantidad, 0);
  badge.textContent = total;
  badge.style.display = total > 0 ? "inline-block" : "none";
}


// Muestra una notificación breve en la esquina de la pantalla
function mostrarToast(nombreProducto) {
  // Si ya existe uno, lo elimina antes de crear otro
  const anterior = document.getElementById("toast");
  if (anterior) anterior.remove();

  const toast = document.createElement("div");
  toast.id = "toast";
  toast.className = "toast";
  toast.textContent = '"' + nombreProducto + '" agregado al carrito';
  document.body.appendChild(toast);

  // Aparece con un pequeño retraso para que el CSS lo anime
  setTimeout(() => toast.classList.add("toast-visible"), 10);

  // Se oculta después de 2.5 segundos
  setTimeout(() => {
    toast.classList.remove("toast-visible");
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

function aplicarTema() {
  const tema = localStorage.getItem("tema") || "oscuro";
  document.body.classList.toggle("tema-claro", tema === "claro");
}

function toggleTema() {
  const actual = localStorage.getItem("tema") || "oscuro";
  const nuevo = actual === "oscuro" ? "claro" : "oscuro";
  localStorage.setItem("tema", nuevo);
  document.body.classList.toggle("tema-claro", nuevo === "claro");
  const btn = document.getElementById("btn-tema");
  if (btn) btn.textContent = nuevo === "claro" ? "Oscuro" : "Claro";
}
