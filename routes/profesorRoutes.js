import { Router } from 'express';
const router = Router();
import {
  getProfesores,
  getProfesorById,
  createProfesor,
  updateProfesor,
  deleteProfesor,
} from '../controllers/profesorController.js';

router.get('/', getProfesores);
router.get('/:id', getProfesorById);
router.post('/', createProfesor);
router.put('/:id', updateProfesor);
router.delete('/:id', deleteProfesor);

// Manejo de método no permitido para DELETE /profesoress
router.delete('/', (req, res) => {
  res.status(405).json({ error: 'Método no permitido en esta ruta' });
});


export default router;
