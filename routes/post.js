const router = require('express').Router();
const postCtrl = require('../controllers/post');

router.route('/create-post').post(postCtrl.createPost);
router.route('/delete-post/:id').get(postCtrl.deletePost);

module.exports = router;