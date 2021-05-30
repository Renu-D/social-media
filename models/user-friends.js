
const friend = (sequelize, DataTypes) => {
    const Friend = sequelize.define('Friend', {
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
        }
    });

    return Friend;
};

module.exports = friend;
