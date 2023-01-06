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

postRoute.get("/getpost/:id", async (req,res)=>{
    try {
        const {id} = req.params;
        const post = await postModel.findById(id).populate("author");

        if (!post) {
            return res.status(400).json({msg: 'Post não encontrado'});
        };
        return res.status(200).json(post);
    } catch (error) {
        console.log(error);
        return res.status(500).json({msg: 'Erro ao consultar um post'});
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

postRoute.get("/category", async (req,res)=>{
    try {
        const categories = await postModel.find({},{_id: 0, category: 1});
        
        const allCategory = []
        for (let i=0; i < categories.length; i++){
            if (categories[i].category.length > 0){
              for (let j=0; j < categories[i].category.length; j++){
                allCategory.push(categories[i].category[j])
              }
            }   
        }
        const uniqueCategories = allCategory.filter((item, index) => allCategory.indexOf(item) === index);
       
        return res.status(200).json({category: uniqueCategories});
    } catch (error) {
        console.log(error);
        return res.status(500).json({msg: 'Erro ao consultar as categorias'});
    }
})

export default postRoute;

