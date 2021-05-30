const Sequelize = require('sequelize');
const config = require('../config/index');

// const User = require('../models/user');
// const Post = require('../models/post');

// Data base connection
const sequelize = new Sequelize(config.DB_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});

const models = {
    User: require('../models/user')(sequelize, Sequelize.DataTypes),
    Post: require('../models/post')(sequelize, Sequelize.DataTypes),
    Friendship: require('../models/friendship')(sequelize, Sequelize.DataTypes),
    Friend: require('../models/user-friends')(sequelize, Sequelize.DataTypes),
    Chat: require('../models/chat')(sequelize, Sequelize.DataTypes)
};

Object.keys(models).forEach(modelName => {
    if ('associate' in models[modelName]) {
        models[modelName].associate(models);
    }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;