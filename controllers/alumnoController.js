import Alumno from '../models/alumno.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import s3Client from '../config/awsConfig.js'; 
import { PublishCommand } from "@aws-sdk/client-sns";
import snsClient from "../config/snsConfig.js";
import { PutItemCommand, QueryCommand , UpdateItemCommand, ScanCommand  } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import dynamoClient from "../config/dynamoConfig.js";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const alumnos = [];
// Función de validación para Alumno
function validarAlumno(data) {
  const { nombres, apellidos, matricula, promedio } = data;

  if (typeof nombres !== "string" || !/^[A-Za-z\s]+$/.test(nombres.trim())) {
      return { valido: false, mensaje: "El campo 'nombres' es obligatorio y solo debe contener letras y espacios" };
  }

  if (typeof apellidos !== "string" || !/^[A-Za-z\s]+$/.test(apellidos.trim())) {
      return { valido: false, mensaje: "El campo 'apellidos' es obligatorio y solo debe contener letras y espacios" };
  }

  if (typeof matricula !== "string" || !/^[A-Za-z0-9]+$/.test(matricula)) {
      return { valido: false, mensaje: "El campo 'matricula' debe ser una cadena alfanumérica" };
  }

  if (typeof promedio !== "number" || isNaN(promedio) || promedio < 0 || promedio > 10) {
      return { valido: false, mensaje: "El campo 'promedio' debe ser un número entre 0 y 10" };
  }

  return { valido: true };
}

// Obtener todos los alumnos desde la base de datos
export async function getAlumnos(req, res) {
    try {
        // Usar el modelo Alumno para obtener todos los registros
        const alumnos = await Alumno.findAll();
        res.status(200).json(alumnos); // Devolver los datos como JSON
    } catch (error) {
        console.error('Error al obtener los alumnos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// Obtener un alumno por ID
export async function getAlumnoById(req, res) {
  try {
      const alumno = await Alumno.findByPk(parseInt(req.params.id)); // Asegurar que el ID es numérico

      if (!alumno) {
          return res.status(404).json({ error: "Alumno no encontrado" });
      }

      res.status(200).json(alumno);
  } catch (error) {
      console.error("Error al obtener el alumno:", error);
      res.status(500).json({ error: "Error interno del servidor" });
  }
}


// Crear un nuevo alumno
export async function createAlumno(req, res) {
  try {
      // Validar los datos de entrada
      const validacion = validarAlumno(req.body);
      if (!validacion.valido) {
          return res.status(400).json({ error: validacion.mensaje });
      }

      // Extraer los datos de la solicitud
      const { nombres, apellidos, matricula, promedio, email, password, fotoPerfilUrl } = req.body;

      // Crear el alumno en la base de datos
      const alumno = await Alumno.create({
          nombres,
          apellidos,
          matricula,
          promedio,
          email,
          password,
          fotoPerfilUrl,
      });

      // Respuesta exitosa
      res.status(201).json({
          message: "Alumno creado correctamente",
          id: alumno.id, // Incluye el ID generado
          alumno,
      });
  } catch (error) {
      console.error("Error al crear alumno:", error);

      // Manejar errores específicos
      if (error.name === "SequelizeValidationError") {
          return res.status(400).json({
              error: "Error de validación: " + error.errors.map((e) => e.message).join(", "),
          });
      }

      // Respuesta para errores inesperados
      res.status(500).json({ error: "Error interno del servidor" });
  }
}

  
// Actualizar un alumno por ID
export async function updateAlumno(req, res) {
  try {

      // Buscar el alumno por ID
      const alumno = await Alumno.findByPk(req.params.id);
      if (!alumno) {
          console.error("Alumno no encontrado con ID:", req.params.id);
          return res.status(404).json({ error: "Alumno no encontrado" });
      }

      // Validar los datos recibidos
      const validacion = validarAlumno(req.body);
      if (!validacion.valido) {
          console.error("Validación fallida:", validacion.mensaje);
          return res.status(400).json({ error: validacion.mensaje });
      }

      // Extraer los datos a actualizar
      const { nombres, apellidos, matricula, promedio } = req.body;

      // Verificar que no se esté intentando asignar valores nulos o inválidos
      if (!nombres || !matricula || promedio === undefined || promedio < 0 || promedio > 10) {
          console.error("Campos inválidos detectados en la solicitud");
          return res.status(201).json({ error: "Campos inválidos en la solicitud" });
      }

      // Actualizar el alumno en la base de datos
      await alumno.update({ nombres, apellidos, matricula, promedio });

      res.status(200).json({ message: "Alumno actualizado correctamente", alumno });
  } catch (error) {
      console.error("Error al actualizar alumno:", error);
      res.status(500).json({ error: "Error interno del servidor" });
  }
}


// Eliminar un alumno por ID
export async function deleteAlumno(req, res) {
  try {
      const alumno = await Alumno.findByPk(req.params.id);
      if (!alumno) {
          return res.status(404).json({ error: "Alumno no encontrado" });
      }

      await alumno.destroy();
      res.status(200).json({ message: "Alumno eliminado correctamente" });
  } catch (error) {
      console.error("Error al eliminar alumno:", error);
      res.status(500).json({ error: "Error interno del servidor" });
  }
}

// Subir la foto de perfil a S3
export async function uploadFotoPerfil(req, res) {
  
  const { id } = req.params; // ID del alumno recibido

  try {
      const alumno = await Alumno.findByPk(id);

      if (!alumno) {
          console.error("Alumno no encontrado con ID:", id);
          return res.status(404).json({ error: "Alumno no encontrado" });
      }
      if (!req.file) {
          console.error("Archivo no encontrado en la petición. Verifica si multer está configurado.");
          return res.status(400).json({ error: "Archivo de foto no proporcionado" });
      }

      const fileKey = `fotoPerfilUrl/${Date.now()}_${req.file.originalname}`;
      const params = {
          Bucket: "alumnos-fotos-perfil", // Nombre del bucket
          Key: fileKey, // Clave única del archivo
          Body: req.file.buffer, // Contenido del archivo
          ContentType: req.file.mimetype, // Tipo de contenido
          ACL: "public-read", // Permisos públicos
      };

      const command = new PutObjectCommand(params);

      await s3Client.send(command);
      const fileUrl = `https://${params.Bucket}.s3.amazonaws.com/${fileKey}`;

      alumno.fotoPerfilUrl = fileUrl;
      await alumno.save();
      res.status(200).json({
          message: "Foto de perfil subida correctamente",
          fotoPerfilUrl: fileUrl,
      });
  } catch (error) {
      // Manejo de errores
      console.error("Error durante el proceso de subida de foto:", error);
      if (error.name === "SequelizeValidationError") {
          console.error("Error de validación de Sequelize:", error.errors);
      } else if (error.code === "NoSuchBucket") {
          console.error("El bucket especificado no existe:", error);
      } else if (error.name === "TimeoutError") {
          console.error("Error de timeout al conectar con S3:", error);
      }
      res.status(500).json({ error: "Error interno del servidor" });
  }
}


export async function sendEmailNotification(req, res) {
    const { id } = req.params;
  try {
    // Busca al alumno en tu base de datos
    const alumno = await Alumno.findByPk(id);
    if (!alumno) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }
    // Configura el mensaje a enviar
    const mensaje = `Calificaciones de ${alumno.nombres} ${alumno.apellidos}: Promedio - ${alumno.promedio}`;
    // Publica el mensaje en el Topic SNS
    const params = {
      TopicArn: "arn:aws:sns:us-east-1:041075466834:calificaciones-alumnos", // Reemplaza con tu ARN del topic
      Message: mensaje,
    };
    const command = new PublishCommand(params);
    const response = await snsClient.send(command);

    res.status(200).json({
      message: "Notificación enviada exitosamente",
      response,
    });
  } catch (error) {
    console.error("Error enviando notificación a SNS:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};


export async function loginSession (req, res) {
    const { id } = req.params;
    const { password } = req.body;
  
    try {
      // Verificar contraseña del alumno
      const alumno = await Alumno.findByPk(id);
      if (!alumno || alumno.password !== password) {
        return res.status(400).json({ error: "Credenciales incorrectas" });
      }
  
      // Crear la sesión
      const sessionId = uuidv4();
      const timestamp = Date.now();
      const sessionString = Array(128)
        .fill(null)
        .map(() => Math.random().toString(36).charAt(2))
        .join("");
  
      const params = {
        TableName: "sesiones-alumnos",
        Item: {
          id: { S: sessionId },
          fecha: { N: timestamp.toString() },
          alumnoId: { N: id.toString() },
          active: { BOOL: true },
          sessionString: { S: sessionString },
        },
      };
  
      await dynamoClient.send(new PutItemCommand(params));
  
      res.status(200).json({
        message: "Sesión iniciada correctamente",
        sessionId,
        sessionString,
      });
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  export async function verifySession(req, res) {
    const { id } = req.params; // Este es el alumnoId
    const { sessionString } = req.body; // String de sesión recibido
  
    try {
      console.log("Iniciando verificación de sesión...");
      console.log("AlumnoId recibido:", id);
      console.log("SessionString recibido:", sessionString);
  
      // Buscar el UUID del alumno usando el alumnoId
      const scanParams = {
        TableName: "sesiones-alumnos",
        FilterExpression: "alumnoId = :alumnoId",
        ExpressionAttributeValues: {
          ":alumnoId": { N: id }, // N porque alumnoId es numérico
        },
      };
  
      console.log("Parámetros de consulta por alumnoId:", scanParams);
  
      const scanCommand = new ScanCommand(scanParams);
      const scanResult = await dynamoClient.send(scanCommand);
  
      console.log("Resultado de la búsqueda por alumnoId:", scanResult);
  
      if (scanResult.Items.length === 0) {
        console.error("No se encontró ningún registro para el alumnoId proporcionado");
        return res.status(400).json({ error: "Sesión inválida o no encontrada" });
      }
  
      // Obtener el primer elemento (siempre debería haber solo uno)
      const sessionData = unmarshall(scanResult.Items[0]);
      console.log("Datos de sesión encontrados:", sessionData);
      console.log("sessionString", sessionString);
      
  
      // Validar el sessionString y active
      if (sessionData.sessionString === sessionString && sessionData.active === true) {
        console.log("Sesión válida y activa");
        return res.status(200).json({ message: "Sesión válida y activa" });
      }
  
      console.log("Sesión inválida o inactiva");
      return res.status(400).json({ error: "Sesión inválida o inactiva" });
    } catch (error) {
      console.error("Error al verificar la sesión:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  export async function logoutSession(req, res) {
    const { id } = req.params; // ID del alumno recibido en la URL
    const { sessionString } = req.body; // sessionString recibido en el cuerpo de la petición

    try {
        console.log("ID recibido:", id);
        console.log("SessionString recibido:", sessionString);

        // Escanear todas las sesiones en la tabla
        const scanParams = {
            TableName: "sesiones-alumnos",
            FilterExpression: "alumnoId = :id AND sessionString = :sessionString",
            ExpressionAttributeValues: {
                ":id": { N: id }, // Asegúrate de que el tipo de dato sea correcto (N para Number)
                ":sessionString": { S: sessionString },
            },
        };

        console.log("Parámetros para escanear sesiones:", scanParams);

        const scanCommand = new ScanCommand(scanParams);
        const scanResponse = await dynamoClient.send(scanCommand);

        console.log("Respuesta de DynamoDB al escanear sesiones:", scanResponse);

        if (!scanResponse.Items || scanResponse.Items.length === 0) {
            console.error("Sesión no encontrada para el alumnoId y sessionString proporcionados");
            return res.status(400).json({ error: "Sesión no encontrada o ya cerrada" });
        }

        const session = unmarshall(scanResponse.Items[0]); // Asume que solo habrá una coincidencia
        console.log("Sesión encontrada:", session);

        // Actualizar la sesión encontrada
        const updateParams = {
            TableName: "sesiones-alumnos",
            Key: {
                id: { S: session.id }, // ID de la sesión encontrada
            },
            UpdateExpression: "SET active = :inactive",
            ExpressionAttributeValues: {
                ":inactive": { BOOL: false },
            },
        };

        console.log("Parámetros para actualizar sesión:", updateParams);

        await dynamoClient.send(new UpdateItemCommand(updateParams));

        res.status(200).json({ message: "Sesión cerrada correctamente" });
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
}