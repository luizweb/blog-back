import express from 'express';
import postModel from '../models/post.model.js';

const postRoute = express.Router();

postRoute.get("/", async (req,res)=>{
    try {
        const posts = await postModel.find().sort({createdAt: -1});
        return res.status(200).json(posts);
    } catch (error) {
        console.log(error);
        return res.status(500).json({msg: 'Erro ao consultar todos os posts'});
    }
});

postRoute.get("/:id", async (req,res)=>{
    try {
        const {id} = req.params;
        const post = await postModel.findById(id);

        if (!post) {
            return res.status(400).json({msg: 'Post não encontrado'});
        };
        return res.status(200).json(post);
    } catch (error) {
        console.log(error);
        return res.status(500).json({msg: 'Erro ao consultar um posts'});
    }
});

postRoute.post("/new-post", async (req,res)=>{
    try {
        const newPost = await postModel.create(req.body);
        return res.status(201).json(newPost);
    } catch (error) {
        console.log(error);
        return res.status(500).json({msg: 'Erro ao criar um post'});
    }
});

postRoute.delete("/delete/:id", async (req,res)=>{
    try {
        const {id} = req.params;
        const deletePost = await postModel.findByIdAndDelete(id);

        if (!deletePost) {
            return res.status(400).json({msg: 'Post não encontrado'});
        };

        return res.status(200).json(deletePost);
    } catch (error) {
        console.log(error);
        return res.status(500).json({msg: 'Erro ao criar um post'});
    }
});

export default postRoute;

