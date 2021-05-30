const router = require('express').Router();
const chatCtrl = require('../controllers/chat');

router.route('/sendMessage/:friendId').post(chatCtrl.sendMessage);
router.route('/viewMessages/:friendId').get(chatCtrl.viewMessages);

module.exports = router;