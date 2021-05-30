const app = require('./app');

const server = app.listen(app.get('PORT'), () => {
    console.log(`Social Media app listening at http://localhost:${app.get('PORT')}`)
});

module.exports = server;
