const router = require('express').Router();
const userCtrl = require('../controllers/user');

const multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, new Date().toString() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});


router.route('/create-user').post(userCtrl.createUser);
router.route('/login').post(userCtrl.login);
router.route('/forgot-password').post(userCtrl.forgotPassword);
router.route('/reset-password').post(userCtrl.resetPassword);
router.route('/updateProfile/:id').post(upload.single('profilePic'), userCtrl.updateProfile);
router.route('/getProfile').get(userCtrl.getProfile);
router.route('/getUsers').get(userCtrl.getUsers);
router.route('/getUserById/:id').get(userCtrl.getUserById);
router.route('/requestFriend').post(userCtrl.sendRequest);
router.route('/getFriendRequests').get(userCtrl.getFriendRequests);
router.route('/respondRequest/:requestId').post(userCtrl.respondRequest);
router.route('/myFriends').get(userCtrl.myFriends);
router.route('/removeFriend/:friendId').get(userCtrl.removeFriend);
router.route('/mutualFriends/:friendId').get(userCtrl.mutualFriends);
router.route('/friendsOfFriends').get(userCtrl.friendsOfFriends);

module.exports = router;