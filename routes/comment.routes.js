import express from 'express';
import commentModel from '../models/comment.model.js';
import postModel from '../models/post.model.js';
import userModel from '../models/user.model.js';

const commentRoute = express.Router();


// comments by post
commentRoute.get("/:postId", async (req,res)=>{
    try {
        const {postId} = req.params;
        const comments = await commentModel.find({postId: postId}).populate("commenter").populate("reply.commenter");
        return res.status(200).json(comments);
    } catch (error) {
        console.log(error);
        return res.status(500).json({msg: 'Erro ao buscar os commentários de um post'});
    }
});

// add comment
commentRoute.post("/add", async (req,res)=>{
    try {
        /* postId,commenter,comment */   
        const {postId, commenter} = req.body;
        const addComment = await commentModel.create(req.body);
        await postModel.findByIdAndUpdate(postId, {$push: {comments: addComment._id}}, {new: true, runValidators: true});
        await userModel.findByIdAndUpdate(commenter, {$push: {comments: addComment._id}}, {new: true, runValidators: true});

        return res.status(201).json(addComment);
    } catch (error) {
        console.log(error);
        return res.status(500).json({msg: 'Erro ao comentar um post'});
    }
});


// reply comment
commentRoute.put("/reply", async (req,res)=>{
    try {
        const {commentId} = req.body;
        const addReply = await commentModel.findByIdAndUpdate(commentId, {$push: {reply: req.body}}, {new: true, runValidators: true});
        return res.status(201).json(addReply); 


    } catch (error) {
        console.log(error);
        return res.status(500).json({msg: 'Erro ao comentar um post'});
    }
});


// delete comment
commentRoute.put("/delete", async (req,res)=>{
    try {
        const {postId, userId, commentId} = req.body;
        const deleteComment = await commentModel.findByIdAndDelete(commentId);

        if (!deleteComment) {
            return res.status(400).json({msg: 'Comentario não encontrado'});
        };

        await postModel.findByIdAndUpdate(postId, {$pull: {comments: commentId}}, {new: true, runValidators: true});
        await userModel.findByIdAndUpdate(userId, {$pull: {comments: commentId}}, {new: true, runValidators: true});

        return res.status(200).json(deleteComment);
    } catch (error) {
        console.log(error);
        return res.status(500).json({msg: 'Erro ao apagar um comentario'});
    }
});


export default commentRoute;
