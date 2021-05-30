const config = {
    PORT: process.env.PORT || 3000,
    SALT_ROUNDS: process.env.SALT_ROUNDS || 10,
    SECRET: process.env.SECRET || 'my s3cr3t',
    DB_URL: process.env.DB_URL || 'postgres://postgres:postgres@127.0.0.1:5432/social_media',
    // plivo config
    PLIVO_AUTH_ID: process.env.PLIVO_AUTH_ID || 'MANZJMZDNJNDDINTEZYJ',
    PLIVO_AUTH_TOKEN: process.env.PLIVO_AUTH_TOKEN || 'NmYzNTE2NTI3NTg1NTY3YjAxMjE1NDcyMmE1YTY0',
};

module.exports = config;