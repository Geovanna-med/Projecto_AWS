import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Alumno = sequelize.define(
  'Alumno',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombres: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apellidos: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    matricula: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    promedio: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 10,
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fotoPerfilUrl: {
      type: DataTypes.STRING,
      allowNull: true, // Este campo es opcional
    },
  },
  {
    tableName: 'alumnos',
    timestamps: true,
  }
);

export default Alumno;
