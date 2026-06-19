const iniciarDB = require("./database");
const Producto = require("./models/Producto");

// Mapeo: nombre del producto → imagen correcta (igual que el datos.js original)
const imagenes = {
  "God of War Ragnarok":       "../img/God_of_War_ragnarok.png",
  "Spider-Man 2":              "../img/Spider-Man_2-.png",
  "Hogwarts Legacy":           "../img/Hogwarts_Legacy-.png",
  "Elden Ring":                "../img/Elden Ring.png",
  "FIFA 25":                   "../img/FC_26.png",
  "Mortal Kombat 1":           "../img/Moral_Kombat_11.png",
  "Cyberpunk 2077":            "../img/Cyberpunk_2077.png",
  "The Last of Us Part I":     "../img/The_last_of_us-.png",
  "Control PS5 DualSense":     "../img/Joystick_DualSense_PS5.png",
  "Auriculares HyperX Cloud":  "../img/Auriculares Razer BlackShark.png",
  "Teclado Mecánico Redragon": "../img/Teclado Redragon k552.png",
  "Mouse Logitech G502":       "../img/Mouse Redragon M711.png",
  "Silla Gamer DXRacer":       "../img/Silla_Gamer_DXRacer.png",
  "Monitor LG UltraGear":      "../img/Monitor_LG_24__144Hz.png",
  "Webcam Logitech C920":      "../img/Webcam_Logitech_C920-.png",
  "Pad Gamer XL SteelSeries":  "../img/Pad_XL_Redragon-.png",
};

async function arreglarImagenes() {
  await iniciarDB();

  for (const [nombre, imagen] of Object.entries(imagenes)) {
    await Producto.update({ imagen }, { where: { nombre } });
    console.log(`Actualizado: ${nombre}`);
  }

  console.log("Listo.");
  process.exit();
}

arreglarImagenes();
