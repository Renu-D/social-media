
const chat = (sequelize, DataTypes) => {
    const Chat = sequelize.define('Chat', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            alloNull: false
        },
        userId: {
            type: DataTypes.INTEGER,
            alloNull: false
        },
        friendId: {
            type: DataTypes.INTEGER,
            alloNull: false
        },
        text: {
            type: DataTypes.STRING
        }
    });

    return Chat;
};

module.exports = chat;
