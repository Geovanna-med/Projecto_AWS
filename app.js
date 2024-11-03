import express, { json } from 'express';
const app = express();

// Middlewares
app.use(json());

// Rutas
import alumnoRoutes from './routes/alumnoRoutes.js';
import profesorRoutes from './routes/profesorRoutes.js';

app.use('/alumnos', alumnoRoutes);
app.use('/profesores', profesorRoutes);

//Rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Recurso no encontrado' });
});

// Puerto de escucha
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

