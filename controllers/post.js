const models = require('../util/database');
module.exports.createPost = async (req, res, next) => {
    if (!req.body.content) {
        console.log('post content is missing');
        return next({
            message: 'post content is missing',
            status: 403
        });
    }
    let post;
    try {
        post = await models.Post.create({
            content: req.body.content,
            UserId: req.user && req.user.id
        });
        console.log('Post created successfully!');
    } catch (err) {
        console.log('Error in creating post ', err.toString());
        return next({
            message: 'Oops! error in creating post',
            status: 500
        });
    }
    return res.status(200).json({
        post: post.toJSON()
    });
};

module.exports.deletePost = async (req, res, next) => {
    let post;
    try {
        post = await models.Post.findOne({
            where: { id: req.params.id }
        });
    } catch (err) {
        console.log(err.toString());
        return next({
            message: 'Error in getting post info',
            status: 500
        });
    }
    if (!post) {
        console.log('Post not found');
        return next({
            message: 'Post not found',
            status: 404
        });
    }
    try {
        await post.destroy();
        console.log('Post deleted successfully!');
        return res.json({
            message: 'Post deleted successfully!'
        });
    } catch (err) {
        return next({
            message: 'Error in deleting post',
            status: 500
        });
    }
};