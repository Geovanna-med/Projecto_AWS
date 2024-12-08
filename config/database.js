import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('project', 'admin', 'project-password', {
    host: 'project-database.cfo599c9zgqg.us-east-1.rds.amazonaws.com',
    dialect: 'mysql', // O 'postgres' si usas PostgreSQL
});

export default sequelize;
