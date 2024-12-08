import express, { json } from 'express';
import sequelize from './config/database.js';
const app = express();
import Alumno from './models/alumno.js';
import Profesor from './models/profesor.js';

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
const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida.');

    // Sincronizar todas las tablas
    await sequelize.sync({ force: false }); // Cambia `force` a `true` si quieres reiniciar tablas (cuidado con pérdida de datos)
    console.log('Tablas sincronizadas correctamente.');
  } catch (error) {
    console.error('Error al sincronizar las tablas:', error);
  }
})();

