import express from 'express';
import commentModel from '../models/comment.model.js';
import postModel from '../models/post.model.js';
import userModel from '../models/user.model.js';

const postRoute = express.Router();

// all posts active - sorted
postRoute.get("/", async (req,res)=>{
    try {
        const posts = await postModel.find({ active: true }).sort({createdAt: -1});
        return res.status(200).json(posts);
    } catch (error) {
        console.log(error);
        return res.status(500).json({msg: 'Erro ao consultar todos os posts'});
    }
});

// all posts not active - sorted
postRoute.get("/notactive", async (req,res)=>{
    try {
        const posts = await postModel.find({ active: false }).sort({createdAt: -1});
        return res.status(200).json(posts);
    } catch (error) {
        console.log(error);
        return res.status(500).json({msg: 'Erro ao consultar todos os posts'});
    }
});


// one post - with slug
postRoute.get("/post/:slug", async (req,res)=>{
    try {
        const {slug} = req.params;
        const post = await postModel.findOne({slug: slug}).populate("author");

        if (!post) {
            return res.status(400).json({msg: 'Post não encontrado'});
        };
        return res.status(200).json(post);
    } catch (error) {
        console.log(error);
        return res.status(500).json({msg: 'Erro ao consultar um post'});
    }
});

// post by category
postRoute.get("/category/:category", async (req,res)=>{
    try {
        const {category} = req.params;
        const post = await postModel.find({active: true, category: category}).sort({createdAt: -1});

        if (!post) {
            return res.status(400).json({msg: 'Post não encontrado'});
        };
        return res.status(200).json(post);
    } catch (error) {
        console.log(error);
        return res.status(500).json({msg: 'Erro ao consultar um post'});
    }
});

// post by tag
postRoute.get("/tag/:tag", async (req,res)=>{
    try {
        const {tag} = req.params;
        const post = await postModel.find({active: true, tags: tag}).sort({createdAt: -1});

        if (!post) {
            return res.status(400).json({msg: 'Post não encontrado'});
        };
        return res.status(200).json(post);
    } catch (error) {
        console.log(error);
        return res.status(500).json({msg: 'Erro ao consultar um post'});
    }
});


// get all categories - retorna um objeto com os nomes e quantidades das categorias
postRoute.get("/allcategories", async (req,res)=>{
    try {
        const categories = await postModel.find({active: true,},{_id: 0, category: 1});
        
        const allCategories = []
        for (let i=0; i < categories.length; i++){
            if (categories[i].category.length > 0){
              for (let j=0; j < categories[i].category.length; j++){
                allCategories.push(categories[i].category[j])
              }
            }   
        }
        
        /* const uniqueCategories = allCategories.filter((item, index) => allCategories.indexOf(item) === index); */
        const uniqueCategory = {};
        for (const num of allCategories) {
            uniqueCategory[num] = uniqueCategory[num] ? uniqueCategory[num] + 1 : 1;
        }
       
        const sortedCategories = Object.fromEntries(
            Object.entries(uniqueCategory).sort()
        );

        return res.status(200).json(sortedCategories);
    } catch (error) {
        console.log(error);
        return res.status(500).json({msg: 'Erro ao consultar as categorias'});
    }
});


// get all tags - retorna um objeto com os nomes e quantidades das tags
postRoute.get("/alltags", async (req,res)=>{
    try {
        const tags = await postModel.find({active: true},{_id: 0, tags: 1});
        
        const allTags = []
        for (let i=0; i < tags.length; i++){
            if (tags[i].tags.length > 0){
              for (let j=0; j < tags[i].tags.length; j++){
                allTags.push(tags[i].tags[j])
              }
            }   
        }
        
        const uniqueTag = {};
        for (const num of allTags) {
            uniqueTag[num] = uniqueTag[num] ? uniqueTag[num] + 1 : 1;
        }
       
        const sortedTags = Object.fromEntries(
            Object.entries(uniqueTag).sort()
        );

        return res.status(200).json(sortedTags);
    } catch (error) {
        console.log(error);
        return res.status(500).json({msg: 'Erro ao consultar as categorias'});
    }
});

// new post
postRoute.post("/new-post", async (req,res)=>{
    try {
        const newPost = await postModel.create(req.body);
        return res.status(201).json(newPost);
    } catch (error) {
        console.log(error);
        return res.status(500).json({msg: 'Erro ao criar um post'});
    }
});

// delete post by id
postRoute.delete("/delete/:id", async (req,res)=>{
    
    try {
        const {id} = req.params;
        const deletePost = await postModel.findByIdAndDelete(id);
        
        if (!deletePost) {
            return res.status(400).json({msg: 'Post não encontrado'});
        };

        deletePost.comments.map(async comment => {
            await userModel.updateMany({}, {$pull: {comments: comment}});
        })

        await commentModel.deleteMany({postId: id});        
        await userModel.updateMany({}, {$pull: {likes: id}});        
        await userModel.updateMany({}, {$pull: {savedPosts: id}}); 

        return res.status(200).json(deletePost);
    } catch (error) {
        console.log(error);
        return res.status(500).json({msg: 'Erro ao criar um post'});
    }
});


// like / unlike post
postRoute.put("/like", async (req,res)=>{
    
    try {
        const {postId, userId} = req.body;
        const liked = await postModel.findOne({_id: postId, likes: userId})
        

        if (!liked){
            const like = await postModel.findByIdAndUpdate(postId, {$push: {likes: userId}}, {new: true, runValidators: true});
            await userModel.findByIdAndUpdate(userId, {$push: {likes: postId}}, {new: true, runValidators: true});
            
            return res.status(200).json(like)
        }
        else {
            const unlike = await postModel.findByIdAndUpdate(postId, {$pull: {likes: userId}}, {new: true, runValidators: true});
            await userModel.findByIdAndUpdate(userId, {$pull: {likes: postId}}, {new: true, runValidators: true});
            
            return res.status(200).json(unlike)
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({msg: 'Erro ao gerar um like ou deslike'});
    }
})


// bookmark post
postRoute.put("/save", async (req,res)=>{
    try {
        const {postId, userId} = req.body;
        const saved = await postModel.findOne({_id: postId, savedPosts: userId})
        
        if (!saved){
            const save = await postModel.findByIdAndUpdate(postId, {$push: {savedPosts: userId}}, {new: true, runValidators: true});
            await userModel.findByIdAndUpdate(userId, {$push: {savedPosts: postId}}, {new: true, runValidators: true});

            return res.status(200).json(save)
        }
        else {
            const remove = await postModel.findByIdAndUpdate(postId, {$pull: {savedPosts: userId}}, {new: true, runValidators: true});
            await userModel.findByIdAndUpdate(userId, {$pull: {savedPosts: postId}}, {new: true, runValidators: true});
            
            return res.status(200).json(remove)
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({msg: 'Erro ao gerar salvar ou remover um bookmark do post'});
    }
})


// activate / deactivate post - admin
postRoute.put("/active", async (req,res)=>{
    try {
        const {postId, activate} = req.body;
        
        const active = await postModel.findByIdAndUpdate(postId, {active: activate}, {new: true, runValidators: true});
        return res.status(200).json(active)

       
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({msg: 'Erro ao ativar ou desativar um post'});
    }
})

export default postRoute;