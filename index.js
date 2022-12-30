import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';

import connect from './config/db.config.js';

import userRoute from './routes/user.routes.js';
import postRoute from './routes/post.routes.js';


dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

connect();

app.get("/", (req,res)=>{
    return res.status(200).json({msg: "Blog"})
});

app.use("/user", userRoute);
app.use("/post", postRoute);



app.listen(process.env.PORT, ()=>{
    console.log(`App up and running on port http://localhost:${process.env.PORT}`);
});
