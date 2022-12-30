import express from 'express';
import userModel from '../models/user.model.js';

const userRoute = express.Router();

userRoute.get("/", async (req,res)=>{
    try {
        const users = await userModel.find();
        return res.status(200).json(users);
    } catch (error) {
        console.log(error);
        return res.status(500).json({msg: 'Erro ao consultar todos os usuários'});
    }
});

userRoute.get("/:id", async (req,res)=>{
    try {
        const {id} = req.params;
        const user = await userModel.findById(id);

        if (!user) {
            return res.status(400).json({msg: 'Usuário não encontrado'});
        };
        return res.status(200).json(user);
    } catch (error) {
        console.log(error);
        return res.status(500).json({msg: 'Erro ao consultar um usuário'});
    }
});


userRoute.post("/new-user", async (req,res)=>{
    try {
        const newUser = await userModel.create(req.body);
        return res.status(201).json(newUser);
    } catch (error) {
        console.log(error);
        return res.status(500).json({msg: 'Erro ao criar um usuário'});
    }
});

export default userRoute;