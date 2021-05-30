const express = require('express');
const config = require('./config/index');
const app = express();
const routes = require('./routes/index');
const errorHandler = require('./middleware/error-handler');
const cors = require('cors');

const fs = require('fs');

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const customCss = fs.readFileSync((process.cwd()+"/swagger.css"), 'utf8');

const models = require('./util/database');

app.set('PORT', config.PORT);
app.use(express.json());
app.use(cors());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {customCss}));

app.use('/uploads', express.static('uploads'));

process.on('uncaughtException', (err) => {
    console.error(err.message);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error(err.toString());
    process.exit(1);
});

process.on('SIGINT', (err) => {
    console.log(err.toString(), ' stopped the server');
    process.exit(1);
})

/*sequelize.sync() - This creates the table if it doesn't exist (and does nothing if it already exists)
sequelize.sync({ force: true }) - This creates the table, dropping it first if it already existed
sequelize.sync({ alter: true }) - This checks what is the current state of the table in the database 
(which columns it has, what are their data types, etc), and then performs the necessary changes 
in the table to make it match the model
*/
models.sequelize.sync({ alter: true, logging: true }).then(() => {
    console.log('Connection has been established successfully.');
}).catch((err) => {
    console.error('Unable to connect to the database:', error);
})


routes(app);

app.use(errorHandler);

module.exports = app;