const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

const Photo = sequelize.define('Photo', {
  camName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  photo: {
    type: DataTypes.BLOB,
    allowNull: false
  },
  modelData: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

const initDb = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('Database connected and synced.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

module.exports = { sequelize, Photo, initDb };