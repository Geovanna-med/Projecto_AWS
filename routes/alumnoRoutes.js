import { Router } from 'express';
import { upload } from '../config/multer.js';
const router = Router();
import {
  getAlumnos,
  getAlumnoById,
  createAlumno,
  updateAlumno,
  deleteAlumno,
  uploadFotoPerfil,
  sendEmailNotification,
  loginSession,
  verifySession,
  logoutSession,
} from '../controllers/alumnoController.js';

router.get('/', getAlumnos);
router.get('/:id', getAlumnoById);
router.post('/', createAlumno);
router.put('/:id', updateAlumno);
router.delete('/:id', deleteAlumno);
router.post('/:id/fotoPerfil', upload.single('foto'), uploadFotoPerfil);
router.post('/:id/email', sendEmailNotification);
router.post("/:id/session/login", loginSession);
router.post("/:id/session/verify", verifySession);
router.post("/:id/session/logout", logoutSession);

// Manejo de método no permitido para DELETE /alumnos
router.delete('/', (req, res) => {
  res.status(405).json({ error: 'Método no permitido en esta ruta' });
});


export default router;
