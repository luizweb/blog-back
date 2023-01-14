import express from 'express';
import bcrypt from "bcrypt";
import userModel from '../models/user.model.js';

import isAuth from '../middlewares/isAuth.js';
import attachCurrentUser from '../middlewares/attachCurrentUser.js';
import isAdmin from '../middlewares/isAdmin.js';

import generateToken from '../config/jwt.config.js';

const userRoute = express.Router();
const SALT_ROUNDS = 10;

userRoute.get("/admin-user", isAuth, isAdmin, attachCurrentUser, async (req,res)=>{
    try {
        const users = await userModel.find({},{passwordHash: 0});
        return res.status(200).json(users);
    } catch (error) {
        console.log(error);
        return res.status(500).json({msg: 'Erro ao consultar todos os usuários'});
    }
});

userRoute.get("/getuser/:id", async (req,res)=>{
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

userRoute.post("/signup", async (req,res)=>{
    try {
        const {password} = req.body;        
        
        if (!password || !password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[$*&@#])[0-9a-zA-Z$*&@#]{8,}$/)) {
            return res.status(400).json({ message: "Senha não tem os requisitos necessários." });
        }

        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(password, salt);

        const createdUser = await userModel.create({...req.body, passwordHash: hashedPassword});
        
        delete createdUser._doc.passwordHash;
        return res.status(201).json(createdUser);
    } catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
});

userRoute.post("/login", async (req,res)=>{
    try {
        const {email, password} = req.body;
        const user = await userModel.findOne({email: email});

		if (!user){
            return res.status(404).json({msg: "email ou senha inválidos"});
        }

		if (await bcrypt.compare(password, user.passwordHash)) {
            delete user._doc.passwordHash;
	
            const token = generateToken(user);

            return res.status(200).json({
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    profilePic: user.profilePic,
                    role: user.role
                },
                token: token
            });
        }
        else {
            return res.status(401).json({msg: "email ou senha inválidos"})
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
});

userRoute.get("/profile", isAuth, attachCurrentUser, async (req, res) => {
    try {
      if (req.tokenExpired){ // ver isAuth middleware
        //verifica se o token está expirado
        return res.status(401).json({msg: "Token expirado"});
      }
      return res.status(200).json(req.currentUser);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error.errors);
    }    

  });

userRoute.delete("/delete/:id", async (req,res)=>{
    try {
        const {id} = req.params;
        const deleteUser = await userModel.findByIdAndDelete(id);

        if (!deleteUser) {
            return res.status(400).json({msg: 'Usuário não encontrado'});
        };

        return res.status(200).json(deleteUser);
    } catch (error) {
        console.log(error);
        return res.status(500).json(error.errors);
    }
});

userRoute.put("/update/:id", async (req,res)=>{
    try {
        const {id} = req.params;
        const updateUser = await userModel.findByIdAndUpdate(id, {...req.body}, {new: true, runValidators: true});
        return res.status(200).json(updateUser);
    } catch (error) {
        console.log(error);
        return res.status(500).json(error.errors);
    }
});

export default userRoute;