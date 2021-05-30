const userRoutes = require('./user');
const postRoutes = require('./post');
const chatRoutes = require('./chat');
const authMiddleware = require('../middleware/auth');

const routes = (app) => {
    const authRouteFilter = new RegExp('' +
        new RegExp('^(?!^/api\/v\\d+\/login(\/)?$)').source +
        new RegExp('^(?!^/api\/v\\d+\/create-user(\/)?$)').source
    );
    app.use(authRouteFilter, authMiddleware);
    app.use('/api/v1', userRoutes);
    app.use('/api/v1', postRoutes);
    app.use('/api/v1', chatRoutes);
};

module.exports = routes;