const models = require('../util/database');
const { Op, QueryTypes, DataTypes } = require('sequelize');
module.exports.sendMessage = async (req, res, next) => {
    if (!req.body.text) {
        console.log('MISSING - message!');
        return next({
            message: 'MISSING - message!',
            status: 403
        });
    }
    let isFriend;
    let message;
    try {
        isFriend = await models.Friendship.findOne({
            where: {
                senderId: req.user.id,
                recipientId: req.params.friendId,
                status: 'confirm'
            }
        });
        if (!isFriend) {
            console.log('You can not send message to this user');
            return next({
                message: 'You can not send message to this user',
                status: 403
            });
        }
        message = await models.Chat.create({
            userId: req.user.id,
            friendId: req.params.friendId,
            text: req.body.text
        });
    } catch (err) {
        console.log(err.toString());
        return next({
            message: 'Error in sending message',
            status: 500
        });
    }
    console.log('Message sent successfully!');
    return res.status(200).json({
        message: `${req.body.text} sent successfully!`
    });
};

module.exports.viewMessages = async (req, res, next) => {
    let messages = [];
    // let query = `SELECT * FROM "Chats" ORDER BY id DESC`
    try {
        messages = await models.Chat.findAll({
            where: {
                [Op.or]: [{
                    userId: req.user.id,
                    friendId: req.params.friendId
                }, {
                    userId: req.params.friendId,
                    friendId: req.user.id
                }]
            }
        });
    } catch (err) {
        console.log(err.toString());
        return next({
            message: 'Error in getting messages',
            status: 500
        });
    }
    return res.status(200).json(messages);
}