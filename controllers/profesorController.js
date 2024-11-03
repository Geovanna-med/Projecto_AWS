import Profesor from '../models/profesor.js';
const profesores = [];

// Función de validación para Profesor
function validarProfesor(data) {
    const { id, numeroEmpleado, nombres, apellidos, horasClase } = data;

    if (typeof id !== 'number' || isNaN(id)) {
        return { valido: false, mensaje: "El ID debe ser un número válido" };
    }

    if (typeof numeroEmpleado !== 'number' || !Number.isInteger(numeroEmpleado)) {
        return { valido: false, mensaje: "El campo 'numeroEmpleado' debe ser un número entero" };
    }

    // Validación para nombres y apellidos: solo letras y espacios
    if (typeof nombres !== 'string' || !/^[A-Za-z\s]+$/.test(nombres.trim())) {
        return { valido: false, mensaje: "El campo 'nombres' es obligatorio y solo debe contener letras y espacios" };
    }

    if (typeof apellidos !== 'string' || !/^[A-Za-z\s]+$/.test(apellidos.trim())) {
        return { valido: false, mensaje: "El campo 'apellidos' es obligatorio y solo debe contener letras y espacios" };
    }

    if (typeof horasClase !== 'number' || isNaN(horasClase) || horasClase < 0) {
        return { valido: false, mensaje: "El campo 'horasClase' debe ser un número positivo" };
    }

    return { valido: true };
}


// Obtener todos los profesores
export function getProfesores(req, res) {
    try {
        res.status(200).json(profesores);
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// Obtener un profesor por ID
export function getProfesorById(req, res) {
    try {
        const profesor = profesores.find(p => p.id === parseInt(req.params.id));
        if (!profesor) return res.status(404).json({ error: 'Profesor no encontrado' });
        res.status(200).json(profesor);
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// Crear un nuevo profesor
export function createProfesor(req, res) {
    try {
        const validacion = validarProfesor(req.body);
        if (!validacion.valido) {
            return res.status(400).json({ error: validacion.mensaje });
        }

        const { id, nombres, apellidos, numeroEmpleado, horasClase } = req.body;
        const profesor = new Profesor(id, nombres, apellidos, numeroEmpleado, horasClase);
        profesores.push(profesor);
        res.status(201).json({ message: 'Profesor creado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// Actualizar un profesor por ID
export function updateProfesor(req, res) {
    try {
        const profesor = profesores.find(p => p.id === parseInt(req.params.id));
        if (!profesor) return res.status(404).json({ error: 'Profesor no encontrado' });

        const validacion = validarProfesor(req.body);
        if (!validacion.valido) {
            return res.status(400).json({ error: validacion.mensaje });
        }

        const { nombres, apellidos, numeroEmpleado, horasClase } = req.body;
        if (nombres) profesor.nombres = nombres;
        if (apellidos) profesor.apellidos = apellidos;
        if (numeroEmpleado) profesor.numeroEmpleado = numeroEmpleado;
        if (horasClase != null) profesor.horasClase = horasClase;

        res.status(200).json({ message: 'Profesor actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// Eliminar un profesor por ID
export function deleteProfesor(req, res) {
    try {
        const index = profesores.findIndex(p => p.id === parseInt(req.params.id));
        if (index === -1) return res.status(404).json({ error: 'Profesor no encontrado' });

        profesores.splice(index, 1);
        res.status(200).json({ message: 'Profesor eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}
