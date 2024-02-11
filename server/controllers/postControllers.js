const Post = require('../models/postModel')
const User = require('../models/userModel')
const path = require('path')
const fs = require('fs')
const { v4: uuid } = require('uuid')
const HttpError = require('../models/errorModel')


// ============================Create Post
// POST : api/posts
// PROTECTED
const createPost = async (req, res, next) => {
    try {
        let { title, category, description } = req.body;
        if (!title || !category || !description || !req.files) {
            return next(new HttpError("Fill in all fields and choose thumbnail.", 422))
        }
        const { thumbnail } = req.files;

        if (thumbnail.size > 2000000) {
            return next(new HttpError("Thumbnail is too big. File Should be less than 2mb"))
        }
        let filename = thumbnail.name;
        let splittedFilename = filename.split('.')
        let newFilename = splittedFilename[0] + uuid() + "." + splittedFilename[splittedFilename.length - 1];

        thumbnail.mv(path.join(__dirname, '..', '/uploads', newFilename), async (err) => {
            if (err) {
                return next(new HttpError(err))
            }
            else {
                try {
                    const newPost = await Post.create({ title, category, description, thumbnail: newFilename, creator: req.user.id })
                    if (!newPost) {
                        return next(new HttpError("post couldn't be created.", 422))
                    }
                    //find user and increase post count by 1
                    const currentUser = await User.findById(req.user.id)
                    const userPostCount = currentUser.posts + 1;
                    await User.findByIdAndUpdate(req.user.id, { posts: userPostCount })

                    res.status(201).json(newPost)
                } catch (error) {
                    return next(new HttpError(error))
                }
            }
        });

    } catch (error) {
        return next(new HttpError(error))
    }
}





// ============================Get All Post
// GET : api/posts
// UNPROTECTED
const getPosts = async (req, res, next) => {
    try {
        const posts = await Post.find().sort({ updatedAt: -1 })
        res.status(200).json(posts)
    } catch (error) {
        return next(new HttpError(error))
    }
}




// ============================Get single Post
// GET : api/posts/:id
// UNPROTECTED
const getPost = async (req, res, next) => {
    try {
        const postId = req.params.id
        const post = await Post.findById(postId)
        if (!post) {
            return next(new HttpError("Post Not Found.", 404))
        }
        res.status(200).json(post);
    } catch (error) {
        return next(new HttpError(error))
    }
}




// ============================Get Post by category
// GET : api/posts/categories/:category
// UNPROTECTED
const getCatPost = async (req, res, next) => {
    try {
        const { category } = req.params;
        const catPosts = await Post.find({ category }).sort({ createdAt: -1 })
        res.status(200).json(catPosts)
    } catch (error) {
        return next(new HttpError(error))
    }
}




// ============================Get Author Post by category
// GET : api/posts/users/:id
// UNPROTECTED
const getUserPosts = async (req, res, next) => {
    try {
        const { id } = req.params;
        const posts = await Post.find({ creator: id }).sort({ createdAt: -1 })
        res.status(200).json(posts)
    } catch (error) {
        return next(new HttpError(error))
    }
}


// ============================Edit Post 
// PATCH : api/posts/:id
// PROTECTED
const editPost = async (req, res, next) => {
    try {
        let fileName;
        let newFileName;
        let updatedPost;
        const postId = req.params.id;
        let { title, category, description } = req.body;

        if (!title || !category || description.length < 12) {
            return next(new HttpError("Fill in all details,", 422))
        }

        const oldPost = await Post.findById(postId)
        if (!oldPost) {
            return next(new HttpError("Post not found", 404))
        }
        if (req.user.id == oldPost.creator) {
            if (!req.files || !req.files.thumbnail) {
                // No thumbnail uploaded, update post without changing the thumbnail
                updatedPost = await Post.findByIdAndUpdate(postId, { title, category, description }, { new: true })
            }
            else {
                // Thumbnail uploaded

                // Delete old thumbnail from upload
                fs.unlink(path.join(__dirname, '..', 'uploads', oldPost.thumbnail), async (err) => {
                    if (err) {
                        return next(new HttpError(err))
                    }
                })

                // Upload new thumbnail
                const { thumbnail } = req.files;
                if (thumbnail.size > 2000000) {
                    return next(new HttpError("Thumbnail too big. Should be less than 2mb"))
                }
                fileName = thumbnail.name;
                let splittedFilename = fileName.split('.')
                newFileName = splittedFilename[0] + uuid() + "." + splittedFilename[splittedFilename.length - 1]
                thumbnail.mv(path.join(__dirname, '..', 'uploads', newFileName), async (err) => {
                    if (err) {
                        return next(new HttpError(err))
                    }
                })

                // Update post with new thumbnail
                updatedPost = await Post.findByIdAndUpdate(postId, { title, category, description, thumbnail: newFileName }, { new: true })
            }
        }
        if (!updatedPost) {
            return next(new HttpError("Couldn't update post.", 400))
        }
        res.status(200).json(updatedPost)
    } catch (error) {
        return next(new HttpError(error))
    }
}



// ============================Delete Post 
// DELETE : api/posts/:id
// PROTECTED
const deletePost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        if (!postId) {
            return next(new HttpError("Post unavailable.", 400))
        }
        const post = await Post.findById(postId);
        const fileName = post?.thumbnail;
        if (req.user.id == post.creator) {
            //delete thumbnail from uploads folder
            fs.unlink(path.join(__dirname, '..', 'uploads', fileName), async (err) => {
                if (err) {
                    return next(new HttpError(err))
                }
                else {
                    await Post.findByIdAndDelete(postId)
                    //find user and resuce post count by 1
                    const currentUser = await User.findById(req.user.id);
                    const userPostCount = currentUser?.posts - 1;
                    await User.findByIdAndUpdate(req.user.id, { posts: userPostCount })

                    res.json(`Post ${postId} deleted successfully`)
                }
            })
        }
        else {
            return next(new HttpError("Post couldn't be deleted", 403))
        }

    } catch (error) {
        return next(new HttpError(error))
    }
}


module.exports = { createPost, getPosts, getPost, getCatPost, getUserPosts, editPost, deletePost }