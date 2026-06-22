// Productos cargados desde la API (se llena con cargarProductos())
let productos = { juegos: [], accesorios: [] };

// Carga los productos desde el backend y los separa por categoría
async function cargarProductos() {
  try {
    const respuesta = await fetch("http://localhost:3000/api/productos");
    const lista = await respuesta.json();

    productos.juegos      = lista.filter(p => p.categoria === "juegos");
    productos.accesorios  = lista.filter(p => p.categoria === "accesorios");
  } catch (error) {
    console.error("Error al cargar productos:", error);
  }
}


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

function mostrarToast(nombreProducto) {
  const anterior = document.getElementById("toast");
  if (anterior) anterior.remove();

  const toast = document.createElement("div");
  toast.id = "toast";
  toast.className = "toast";
  toast.textContent = '"' + nombreProducto + '" agregado al carrito';
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("toast-visible"), 10);
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
