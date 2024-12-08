import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Profesor = sequelize.define(
  'Profesor',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombres: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^[A-Za-z\s]+$/, // Solo permite letras y espacios
        notEmpty: true,      // No permite valores vacíos
      },
    },
    apellidos: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^[A-Za-z\s]+$/, // Solo permite letras y espacios
        notEmpty: true,
      },
    },
    numeroEmpleado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      validate: {
        isInt: true, // Solo acepta números enteros
        min: 1,      // Mínimo valor permitido
      },
    },
    horasClase: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: 0, // No se permiten valores negativos
      },
    },
  },
  {
    tableName: 'profesores', // Nombre de la tabla en la base de datos
    timestamps: true, // Agrega campos createdAt y updatedAt automáticamente
  }
);

export default Profesor;
