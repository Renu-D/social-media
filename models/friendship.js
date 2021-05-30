
const friendship = (sequelize, DataTypes) => {
    const Friendship = sequelize.define('Friendship', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            alloNull: false
        },
        senderId: {
            type: DataTypes.INTEGER,
            alloNull: false
        },
        recipientId: {
            type: DataTypes.INTEGER,
            alloNull: false
        },
        status: {
            type: DataTypes.STRING
        }
    });

    return Friendship;
};

module.exports = friendship;
