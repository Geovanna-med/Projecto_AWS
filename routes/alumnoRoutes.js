import { Router } from 'express';
const router = Router();
import {
  getAlumnos,
  getAlumnoById,
  createAlumno,
  updateAlumno,
  deleteAlumno,
} from '../controllers/alumnoController.js';

router.get('/', getAlumnos);
router.get('/:id', getAlumnoById);
router.post('/', createAlumno);
router.put('/:id', updateAlumno);
router.delete('/:id', deleteAlumno);

// Manejo de método no permitido para DELETE /alumnos
router.delete('/', (req, res) => {
  res.status(405).json({ error: 'Método no permitido en esta ruta' });
});


export default router;
