import Alumno from '../models/alumno.js';
const alumnos = [];

// Función de validación para Alumno
function validarAlumno(data) {
  const { id, nombres, apellidos, matricula, promedio } = data;

  if (typeof id !== 'number' || isNaN(id)) {
      return { valido: false, mensaje: "El ID debe ser un número válido" };
  }
  if (typeof nombres !== 'string' || !/^[A-Za-z\s]+$/.test(nombres.trim())) {
      return { valido: false, mensaje: "El campo 'nombres' es obligatorio y solo debe contener letras y espacios" };
  }
  if (typeof apellidos !== 'string' || !/^[A-Za-z\s]+$/.test(apellidos.trim())) {
      return { valido: false, mensaje: "El campo 'apellidos' es obligatorio y solo debe contener letras y espacios" };
  }

  // Cambiar la validación de 'matricula' para aceptar cadenas alfanuméricas
  if (typeof matricula !== 'string' || !/^[A-Za-z0-9]+$/.test(matricula)) {
      return { valido: false, mensaje: "El campo 'matricula' debe ser una cadena alfanumérica" };
  }

  if (typeof promedio !== 'number' || isNaN(promedio) || promedio < 0 || promedio > 10) {
      return { valido: false, mensaje: "El campo 'promedio' debe ser un número entre 0 y 10" };
  }

  return { valido: true };
}


// Obtener todos los alumnos
export function getAlumnos(req, res) {
    try {
        res.status(200).json(alumnos);
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// Obtener un alumno por ID
export function getAlumnoById(req, res) {
    try {
        const alumno = alumnos.find(a => a.id === parseInt(req.params.id));
        if (!alumno) return res.status(404).json({ error: 'Alumno no encontrado' });
        res.status(200).json(alumno);
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// Crear un nuevo alumno
export function createAlumno(req, res) {
  try {
      const validacion = validarAlumno(req.body);
      if (!validacion.valido) {
          return res.status(400).json({ error: validacion.mensaje });
      }

      const { id, nombres, apellidos, matricula, promedio } = req.body;
      const alumno = new Alumno(id, nombres, apellidos, matricula, promedio);
      alumnos.push(alumno);
      res.status(201).json({ message: 'Alumno creado correctamente' });
  } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor' });
  }
}


// Actualizar un alumno por ID
export function updateAlumno(req, res) {
  try {
      const alumno = alumnos.find(a => a.id === parseInt(req.params.id));
      if (!alumno) return res.status(404).json({ error: 'Alumno no encontrado' });

      const validacion = validarAlumno(req.body);
      if (!validacion.valido) {
          return res.status(400).json({ error: validacion.mensaje });
      }

      const { nombres, apellidos, matricula, promedio } = req.body;
      if (nombres) alumno.nombres = nombres;
      if (apellidos) alumno.apellidos = apellidos;
      if (matricula) alumno.matricula = matricula;
      if (promedio != null) alumno.promedio = promedio;

      res.status(200).json({ message: 'Alumno actualizado correctamente' });
  } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor' });
  }
};


// Eliminar un alumno por ID
export function deleteAlumno(req, res) {
    try {
        const index = alumnos.findIndex(a => a.id === parseInt(req.params.id));
        if (index === -1) return res.status(404).json({ error: 'Alumno no encontrado' });

        alumnos.splice(index, 1);
        res.status(200).json({ message: 'Alumno eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}
