const bcrypt = require('bcrypt');
const config = require('../config/index');
const models = require('../util/database');
const authMgr = require('../middleware/authMgr');
const { Op, QueryTypes, DataTypes } = require('sequelize');
const SMS = require('./sms');

module.exports.createUser = async (req, res, next) => {
    // console.log('Create User works');
    if (!req.body.username || !req.body.password || !req.body.email ||
        !req.body.mobileNumber) {
        console.log('Please fill all the required fields!');
        return next({
            message: 'Please fill all the required fields!',
            status: 403
        });
    }
    if (isNaN(req.body.mobileNumber) || String(req.body.mobileNumber).length != 10) {
        console.log('Invalid mobileNumber');
        return next({
            message: 'Invalid mobileNumber',
            status: 403
        });
    }

    let userExist;
    try {
        userExist = await models.User.findOne({
            where: {
                [Op.or]: [{username: req.body.username}, {email: req.body.email},
                {mobileNumber: req.body.mobileNumber}]
            }
        });
    } catch (err) {
        console.log('Error in getting user to verify', err.toString());
        return next({
            message: 'Error in getting user to verify',
            status: 403
        });
    }
    if (userExist) {
        return next({
            message: 'username/email/mobileNumber is already exists',
            status: 403
        });
    }

    const password = await bcrypt.hash(req.body.password, config.SALT_ROUNDS);
    
    const user = {
        username: req.body.username,
        email: req.body.email,
        password: password,
        mobileNumber: req.body.mobileNumber
    };
    // Posts: [
    //     {
    //         content: 'New First Post Content'
    //     },
    //     {
    //         content: 'New Second Post Content'
    //     }
    // ]
    // {include: [models.Post]}
    models.User.create(user).then(result => {
        console.log(`user created successully with username = ${result.username}`);
        return res.status(200).json({
            user: result.toJSON()
        });
    }).catch(err => {
        console.log(err);
        return res.status(500).json({
            message: `Oops! error in creating user`
        });
    })
};

module.exports.login = async (req, res, next) => {
    if (!req.body.username || !req.body.password) {
        console.log('username or password is missing');
        return next({
            message: 'username or password is missing',
            status: 403
        });
    }
    let user;
    try {
        user = await models.User.findByLogin(req.body.username);
        if (!user) {
            console.log(`user not found with username = ${req.body.username}`);
            return next({
                message: `user not found with username = ${req.body.username}`,
                status: 404
            });
        }
    } catch (err) {
        console.log('Error in getting user');
        return next({
            message: 'Error in getting user',
            status: 500
        });
    }
    const success = await bcrypt.compare(req.body.password, user.password);
    if (!success) {
        console.error('Incorrect Password, user =', user.username);
        return next({
            message: `Incorrect Password, user = ${user.username}`,
            status: 401
        });
    }
    console.log('Success- bcrypt compare password, User =', user.username);
    const accessToken = authMgr.generateToken(user.toJSON());
    console.info('User loggedIn = ', user.username);
    return res.status(200).json({ accessToken, user: user });
};

module.exports.forgotPassword = async (req, res, next) => {
    if (!req.body.mobileNumber) {
        console.error('MISSING FIELDS - Mobile Number required');
        return next({
            message: 'MISSING FIELDS - Mobile Number required',
            status: 403
        });
    }

    if (isNaN(req.body.mobileNumber) || String(req.body.mobileNumber).length != 10) {
        return next({
            message: 'INVALID-Mobile Number',
            status: 403
        });
    }

    let user;
    try {
        user = await models.User.findOne({
            where: {mobileNumber: req.body.mobileNumber}
        });
    } catch (err) {
        console.log('Error in getting user info');
        return next({
            message: 'Error in getting user info',
            status: 500
        });
    }
    if (!user) {
        console.log('No user found');
        return next({
            message: 'No User found',
            status: 404
        });
    }
    console.log(`User Found with mobileNumber - ${req.body.mobileNumber} with username - ${user.username}`);
    SMS.sendOtp(user).then((message) => {
        return res.status(200).json(message);
    }).catch(err => {
        return next(err);
    });
};

module.exports.resetPassword = async (req, res, next) => {
    if (!req.body.mobileNumber || !req.body.otp || !req.body.password) {
        logger.error('MISSING FIELDS - mobileNumber, otp, password is required');
        return next({
            message: 'MISSING FIELDS - mobileNumber, otp, password is required',
            status: 403
        });
    }
    if (isNaN(req.body.mobileNumber) || String(req.body.mobileNumber).length != 10) {
        return next({
            message: 'INVALID-Mobile Number',
            status: 403
        });
    }

    let user;
    try {
        user = await models.User.findOne({
            where: {mobileNumber: req.body.mobileNumber}
        });
    } catch (err) {
        console.log('Error in getting user info');
        return next({
            message: 'Error in getting user info',
            status: 500
        });
    }
    if (!user) {
        console.log('No user found');
        return next({
            message: 'No User found',
            status: 404
        });
    }
    console.log(`User Found with mobileNumber - ${req.body.mobileNumber} with username - ${user.username}`);
    const currentTime = new Date();
    if (user.otpCode !== Number(req.body.otp)) {
        console.log('Incorrect otp');
        return next({
            message: 'INCORRECT - otp',
            status: 403
        });
    }
    if ((currentTime.getTime() - user.otpGeneratedTime.getTime()) > 15 * 60 * 1000) {
        console.log('Otp expired');
        return next({
            message: 'EXPIRED - otp',
            status: 403
        });
    }
    console.log(`Updating Password of user with mobileNumber - ${req.body.mobileNumber}`);
    const newPassword = await bcrypt.hash(req.body.password, config.SALT_ROUNDS);
    user.password = newPassword;
    try {
        await user.save();
    } catch (err) {
        return next({
            message: 'Error in updating password',
            status: 500
        });
    }
    return res.status(200).json({
        status: 'ok',
        message: 'Password Updated'
    });
};

module.exports.updateProfile = async (req, res, next) => {
    let user;
    try {
        user = await models.User.findOne({
            where: {id: req.params.id}
        });
    } catch (err) {
        console.log(err.toStrin());
        return next({
            message: 'Error in getting user info',
            status: 403
        });
    }
    if (!user) {
        console.log('User is deleted or not found');
        return next({
            message: 'User is deleted or not found',
            status: 404
        });
    }
    if (req.body.username) {
        let userExist;
        try {
            userExist = await models.User.findOne({
                where: {
                    username: req.body.username
                }
            });
        } catch (err) {
            console.log('Error in getting user to verify', err.toString());
            return next({
                message: 'Error in getting user to verify',
                status: 403
            });
        }
        if (userExist) {
            return next({
                message: `username ${req.body.username} is already exists`,
                status: 403
            });
        }
        user.username = req.body.username;
    }
    if (req.body.email) {
        let userExist;
        try {
            userExist = await models.User.findOne({
                where: {
                    email: req.body.email
                }
            });
        } catch (err) {
            console.log('Error in getting user to verify', err.toString());
            return next({
                message: 'Error in getting user to verify',
                status: 403
            });
        }
        if (userExist) {
            return next({
                message: `email ${req.body.email} is already exists`,
                status: 403
            });
        }
        user.email = req.body.email;
    }
    if (req.body.mobileNumber) {

        if (isNaN(req.body.mobileNumber) || String(req.body.mobileNumber).length != 10) {
            return next({
                message: 'INVALID-Mobile Number',
                status: 403
            });
        }
        let userExist;
        try {
            userExist = await models.User.findOne({
                where: {
                    mobileNumber: req.body.mobileNumber
                }
            });
        } catch (err) {
            console.log('Error in getting user to verify', err.toString());
            return next({
                message: 'Error in getting user to verify',
                status: 403
            });
        }
        if (userExist) {
            return next({
                message: `mobileNumber ${req.body.mobileNumber} is already exists`,
                status: 403
            });
        }
        user.mobileNumber = req.body.mobileNumber;
    }
    if (req.file) {
        user.imageType = req.file.mimetype,
        user.imageName = req.file.originalname,
        user.profilePic = req.file.path
    }
    try {
        await user.save();
        console.log('Profile updated successfully!');
        return res.status(200).json({
            message: 'Profile update successfully!'
        });
    } catch (err) {
        console.log(err.toString());
        return next({
            message: 'Error in updating profile',
            status: 500
        });
    }
};

module.exports.getProfile = (req, res, next) => {
    console.log('Got the profile');
    return res.status(200).json({user: req.user});
};

module.exports.getUsers = async (req, res, next) => {
    let query = 'SELECT * FROM "Users" WHERE id != ' + req.user.id;
    let users = [];
    let metadata;
    try {
        [users, metadata] = await models.sequelize.query(query);
    } catch (err) {
        console.log(err.toString());
        return next({
            message: 'Error in getting all users',
            status: 500
        });
    }
    // console.log(users);
    // console.log(metadata);
    console.log('Got users = ', users.length);
    return res.status(200).json(users);
};

module.exports.getUserById = async (req, res, next) => {
    let query = 'SELECT * from "Users" where id = ' + req.params.id;

    let user;
    try {
        user = await models.sequelize.query(query, { type: QueryTypes.SELECT });
    } catch (err) {
        console.log(err.toString());
        return next({
            message: 'Error in getting user info',
            status: 500
        });
    }
    console.log('Got the user');
    return res.status(200).json(user);
}

module.exports.sendRequest = async (req, res, next) => {
    if (!req.body.recipientId || !req.user.id) {
        console.log('MISSING - required fields!');
        return next({
            message: 'MISSING - required fields!',
            status: 403
        });
    }
    if (String(req.body.recipientId) === String(req.user.id)) {
        console.log('INVALID - Can not send request to self!');
        return next({
            message: 'INVALID - Can not send request to self!',
            status: 403
        });
    }
    let requests;
    try {
        requests = await models.Friendship.findAll({
            where: {
                [Op.or]: [{
                    senderId: req.user.id,
                    recipientId: req.body.recipientId,
                    [Op.or]: [{status: 'pending'}, {status: 'confirm'}]
                }]
            }
        });
    } catch (err) {
        console.log(err.toString());
        return next({
            message: 'Error in getting friendship requests',
            status: 500
        });
    }
    // console.log(requests);
    if (requests.length === 0) {
        const request = {
            senderId: req.user.id,
            recipientId: req.body.recipientId,
            status: 'pending'
        };

        try {
            const data = await models.Friendship.create(request);
            // console.log(data);
            console.log(`Friend Request sent successully`);
            return res.status(200).json({
                message: 'Friend Request sent successully!'
            });
        } catch (err) {
            console.log(err.toString());
            return next({
                message: `Oops! error in sending friend request`,
                status: 500
            });
        }
    }
    return res.status(200).json({
        message: 'friend request already exists/accepted!'
    });
};

module.exports.getFriendRequests = async (req, res, next) => {
    console.log("this is the user's ID " + req.user.id);
    let query = 'SELECT request.id,request."senderId" as userId FROM "Friendships" request INNER JOIN "Users" u ON (u.id = request."recipientId") WHERE u.id=' + req.user.id + " AND status = 'pending'";

    let list = [];
    try {
        list = await models.sequelize.query(query, {
            type: QueryTypes.SELECT
        });
    } catch (err) {
        console.log(err.toString());
        return next({
            message: 'Error in gettin friend requests',
            status: 500
        });
    }
    for(let request of list) {
        const user = await models.User.findByPk(request.userid);
        request.username = user.username;
    }
    console.log('Got the friend requests = ', list.length);
    return res.status(200).json(list);
};

module.exports.respondRequest = async (req, res, next) => {
    if (!req.body.senderId || !req.body.status || !req.user.id) {
        console.log('MISSING - required fields!');
        return next({
            message: 'MISSING - required fields!',
            status: 403
        });
    }
    let request;
    try {
        request = await models.Friendship.findByPk(req.params.requestId);
    } catch (err) {
        console.log(err.toString());
        return next({
            message: 'Error in getting request info',
            status: 500
        });
    }
    if (!request) {
        return next({
            message: 'request not found',
            status: 404
        });
    }
    const status = ['confirm', 'cancel'];
    if (!status.includes(req.body.status)) {
        return next({
            message: 'INVALID - status [confirm, cancel]',
            status: 500
        });
    }
    const aquery = `UPDATE Friendships SET status = '${req.body.status}'
        WHERE (senderId = ${req.body.senderId} AND recipientId = ${req.user.id})
        AND (status = 'pending')
        RETURNING * ''`;
    // const params = [sender, recipient_id];
    let data,metadata;
    try {
        // data = await models.sequelize.query(query, { type: QueryTypes.UPDATE });
        [metadata, data] = await models.Friendship.update({
            status: req.body.status
        }, {
            where: {
                [Op.and]: [
                    {senderId: req.body.senderId},
                    {recipientId: req.user.id},
                    {status: 'pending'}
                ]
            },
            returning: true,
            plain: true
        });
    } catch (err) {
        console.log(err.toString());
        return next({
            message: 'Error in updating status',
            status: 500
        });
    }
    console.log('Status updated successfully!');
    if (data && req.body.status === 'confirm') {
        const friends = addFriend(req.user.id, req.body.senderId);
    }
    return res.status(200).json(data);
};

const addFriend = async (userId, friendId) => {
    if (!userId || !friendId) {
        console.log('INVALID - data');
        return;
    }
    let friend;
    try {
        await models.Friendship.create({
            senderId: userId,
            recipientId: friendId,
            status: 'confirm'
        });
        friend = await models.Friend.bulkCreate([
            {
                userId: userId,
                friendId: friendId
            },
            {
                userId: friendId,
                friendId: userId
            }
        ]);
    } catch (err) {
        console.log(err.toString());
        return next({
            message: 'Error in adding friend',
            status: 500
        });
    }
    console.log('Friendship bond created successfully!');
    return friend;
};

module.exports.myFriends = async (req, res, next) => {
    let query = `select f.id,f."userId",f."friendId",f."createdAt",u."username" from "Friends" f INNER JOIN "Users" u on (u.id = f."friendId") where f."userId"=${req.user.id}`;
    let friends = [];
    try {
        friends = await models.sequelize.query(query, {type: QueryTypes.SELECT});
    } catch (err) {
        console.log(err.toString());
        return next({
            message: 'Error in getting friends list',
            status: 500
        });
    }
    console.log('Got Friends List = ', friends.length);
    return res.status(200).json(friends);
};

module.exports.removeFriend = async (req, res, next) => {
    let request;
    try {
        request = await models.Friendship.findOne({
            where: {
                senderId: req.params.friendId,
                recipientId: req.user.id,
                status: 'confirm'
            }
        });
    } catch (err) {
        console.log(err.toString());
        return next({
            message: 'Error in verifying request',
            status: 500
        });
    }
    if (!request) {
        console.log('INVALID - friendId');
        return next({
            message: 'Given Id is not your friendId',
            status: 500
        });
    }
    try {
        await request.destroy();
        await models.Friend.destroy({
            where: {
                [Op.or]: [{
                    [Op.and]: [{friendId: req.params.friendId}, {userId: req.user.id}]
                }, {
                    [Op.and]: [{friendId: req.user.id}, {userId: req.params.friendId}]
                }]
            }
        });
    } catch (err) {
        console.log(err.toString());
        return next({
            message: 'Error in removing friend',
            status: 500
        });
    }
    console.log('Friend removed successully!');
    return res.status(200).json({message: 'Friend removed successully!'});
};

module.exports.mutualFriends = async (req, res, next) => {
    let query = `select u.* from "Friends" f inner join
    "Users" u on (u.id = f."friendId") where f."friendId" in
    (select "friendId" from "Friends" where "userId" = ${req.user.id})
    and f."userId" = ${req.params.friendId}`;
    let list;
    try {
        list = await models.sequelize.query(query, { type: QueryTypes.SELECT });
    } catch (err) {
        console.log(err.toString())
        return next({
            message: 'Error in getting mutual friends',
            status: 500
        });
    }
    console.log('Got Mutual friends list = ', list.length);
    return res.status(200).json(list);
};

module.exports.friendsOfFriends = async (req, res, next) => {
    let query = `select distinct u.* from   "Friends" f1 join
    "Friends" f2 on (f2."userId" = f1."friendId") join "Users" u on (u.id=f2."friendId")
    where  f1."userId" = ${req.user.id} and f2."friendId" != f1."userId";`
    let list;
    try {
        list = await models.sequelize.query(query, { type: QueryTypes.SELECT });
    } catch (err) {
        console.log(err.toString())
        return next({
            message: 'Error in getting mutual friends',
            status: 500
        });
    }
    console.log('Got Friends of friends list = ', list.length);
    return res.status(200).json(list);
};