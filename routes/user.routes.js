import express from 'express';
import bcrypt from "bcrypt";
import userModel from '../models/user.model.js';

import isAuth from '../middlewares/isAuth.js';
import attachCurrentUser from '../middlewares/attachCurrentUser.js';
import isAdmin from '../middlewares/isAdmin.js';

import generateToken from '../config/jwt.config.js';
import commentModel from '../models/comment.model.js';
import postModel from '../models/post.model.js';

import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config();

const userRoute = express.Router();
const SALT_ROUNDS = 10;

const transporter = nodemailer.createTransport({
    service: 'Outlook',
    auth: {
      secure: false,
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS
    }
  });



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
        // Capturando a senha do frontend
        const {email, password} = req.body;        
        
        // Checando se a senha existe e se atende aos critérios de segurança
        if (!password || !password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[$*&@#])[0-9a-zA-Z$*&@#]{8,}$/)) {
            return res.status(400).json({ message: "Senha não tem os requisitos necessários." });
        }

        // Gerar o salt da senha
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        
        // Hashear a senha
        const hashedPassword = await bcrypt.hash(password, salt);

        // Criar o usuário com a senha hasheada
        const createdUser = await userModel.create({...req.body, passwordHash: hashedPassword});
        
        // Deleta o passwordHash do obj antes de retornar a resposta
        delete createdUser._doc.passwordHash;

        // Envia email de confirmação
        const mailOptions = {
            from: 'luiz.agsimoes@outlook.com',
            to: email,
            subject: 'Ativação de conta - Luiz Simoes',
            html: `
            <h1>Bem vindo ao nosso site</h1>
            <p>Confirme seu email clicando no link abaixo</p>
            <a href="https://luizweb.cyclic.app/user/activate-account/${createdUser._id}">Ative sua conta</a>
            `
        }
  
      await transporter.sendMail(mailOptions)


        return res.status(201).json(createdUser);
    } catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
});


// Activate user
userRoute.get('/activate-account/:id', async (req, res) => {
    try {
      // Capturando o id do usuário
      const { id } = req.params
      const user = await userModel.findByIdAndUpdate(id, {confirmedEmail: true, active: true})
  
      return res.send(`Sua conta foi ativada com sucesso ${user.name}`)
  
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Algo deu errado na ativação do usuário' })
    }
  })



userRoute.post("/login", async (req,res)=>{
    try {
        // Capturando email e senha do frontend
        const {email, password} = req.body;

        // Achar o user pelo email
        const user = await userModel.findOne({email: email});

        // Chegar se o email existe
        if (user.confirmedEmail === false) {
            return res.status(401).json({ msg: 'Usuário não confirmado, favor validar email' })
        }

        // Chegar se o usuário existe
		if (!user){
            return res.status(404).json({msg: "email ou senha inválidos"});
        }

        // Comparar as senhas
		if (await bcrypt.compare(password, user.passwordHash)) {
            
            // Delete o passworHash antes de devolver a resposta
            delete user._doc.passwordHash;
	
            // Devolve um token de acesso
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

      const loggedUser = req.currentUser;
      if (!loggedUser) {
        return res.status(404).json({ msg: "User not found." });
      } 

      const user = await userModel.findById(loggedUser._id).populate("savedPosts");
        
      // Deleta o password e a versão
      delete user._doc.passwordHash;
      delete user._doc.__v;

      return res.status(200).json(user);

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

        await commentModel.deleteMany({commenter: id});
        // faltando dar um pull em reply.commenter
        await postModel.updateMany({}, {$pull: {likes: id}});
        await postModel.updateMany({}, {$pull: {savedPosts: id}});
        

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