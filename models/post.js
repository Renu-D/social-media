
const post = (sequelize, DataTypes) => {
    const Post = sequelize.define('Post', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            alloNull: false
        },
        content: DataTypes.STRING
    });

    Post.associate = models => {
        Post.belongsTo(models.User);
    }


    return Post;
};

module.exports = post;
