import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';

import connect from './config/db.config.js';

import userRoute from './routes/user.routes.js';
import postRoute from './routes/post.routes.js';
import uploadRoute from './routes/uploadImage.routes.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

connect();


app.get("/", (req,res)=>{
    res.send(`<h1>luizweb blog</h1>`)
});

/* // query params
// ?theme=dark
app.get("/", (req,res)=>{
    res.send(`<h1>luizweb blog || theme: ${req.query.theme}</h1>`)
});

// dynamic params
app.get("/:username", (req,res)=>{
    res.send(`<p>username: ${req.params.username}</p>`)
}); */






app.use("/user", userRoute);
app.use("/post", postRoute);
app.use('/upload', uploadRoute);


app.listen(process.env.PORT, ()=>{
    console.log(`App up and running on port http://localhost:${process.env.PORT}`);
});
