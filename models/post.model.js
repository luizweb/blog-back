import {Schema, model} from 'mongoose';

const postSchema = new Schema(
    {
        title: { type: String, trim: true },        
        //author: {type: Schema.Types.ObjectId, ref: "User"},
        author: {type: String},
        //category: {},
        //tags: {},
        image: { type: String },   
        summary: { type: String, trim: true }, 
        text: {type: String},
        //likes: {},
        //responses: [],
        //savedPosts: []
    },
    { timestamps: true }
    );

const postModel = model("Post", postSchema);

export default postModel;