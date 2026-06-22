const express = require('express');
const path = require('path');
const session = require('express-session'); // <-- AGREGADO
const db = require('./models/database');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de la sesión (siempre arriba de las rutas)
app.use(session({
    secret: 'secreto_super_seguro_utn_2026',
    resave: false,
    saveUninitialized: false
}));

// Importamos el grupo de rutas del administrador
const adminRoutes = require('./routes/admin'); // <-- AGREGADO
app.use('/admin', adminRoutes);                // <-- AGREGADO


app.get('/', (req, res) => {
    res.send('Servidor Express inicializado.');
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});