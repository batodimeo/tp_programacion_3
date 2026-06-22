const express = require('express');
const path = require('path');
const session = require('express-session');
const cors = require('cors'); 
const db = require('./models/database'); // Inicializa SQLite y siembra al admin

const app = express();
const PORT = 3000;

// 1. Configuración de EJS (Motor de vistas para el administrador)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 2. Middlewares globales
app.use(cors()); // Destraba el bloqueo entre el LiveServer del front y el puerto 3000
app.use(express.urlencoded({ extended: true })); // Para capturar datos de formularios HTML
app.use(express.json()); // Para recibir peticiones en formato JSON
app.use(express.static(path.join(__dirname, 'public'))); // Expone tu style.css y la carpeta /img

// 3. Configuración de la sesión (El "candado" del panel de control)
app.use(session({
    secret: 'secreto_super_seguro_utn_2026',
    resave: false,
    saveUninitialized: false
}));

// 4. Importación de nuestras dos grandes autopistas
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');

app.use('/admin', adminRoutes); // Todo lo del administrador vive bajo /admin/...
app.use('/api', apiRoutes);     // Todo lo del cliente vive bajo /api/...

// Ruta raíz de cortesía
app.get('/', (req, res) => {
    res.send('Servidor ArgenGaming funcionando. Ingresá a /admin/login o a /api/productos');
});

// 5. Encendido
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});