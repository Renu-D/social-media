
const user = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            alloNull: false
        },
        username: {
            type: DataTypes.STRING,
            unique: true,
            alloNull: false,
            validate: {
                notEmpty: true,
            }
        },
        email: {
            type: DataTypes.STRING,
            unique: true
        },
        password: DataTypes.STRING,
        mobileNumber: DataTypes.STRING,
        otpCode: DataTypes.INTEGER,
        otpGeneratedTime: DataTypes.DATE,
        imageType: DataTypes.STRING,
        imageName: DataTypes.STRING,
        profilePic: DataTypes.STRING
    });

    User.associate = models => {
        User.hasMany(models.Post, { onDelete: 'CASCADE' });
    }

    User.findByLogin = async login => {
        let user = await User.findOne({
          where: { username: login },
        });
     
        if (!user) {
          user = await User.findOne({
            where: { email: login },
          });
        }
     
        return user;
    };

    return User;
};

module.exports = user;
