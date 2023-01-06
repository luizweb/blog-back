import {Schema, model} from 'mongoose';

const postSchema = new Schema(
    {
        title: { type: String, trim: true },        
        author: {type: Schema.Types.ObjectId, ref: "User"},
        category: [{type: String}],
        image: { type: String },   
        summary: { type: String, trim: true }, 
        text: {type: String},
        likes: [{type: Schema.Types.ObjectId, ref: "User"}],
        comments: [{type: Schema.Types.ObjectId, ref: "Comment"}],
        savedPosts: [{type: Schema.Types.ObjectId, ref: "User"}]
    },
    { timestamps: true }
    );

const postModel = model("Post", postSchema);

export default postModel;