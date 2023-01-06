import {Schema, model} from 'mongoose';

const commentSchema = new Schema(
    {
        postId: {type: Schema.Types.ObjectId, ref: "Post"},
        commenter: {type: Schema.Types.ObjectId, ref: "User"},
        comment: {type: String, required: true},
        likes: [{type: Schema.Types.ObjectId, ref: "User"}],
        edited: {type: Boolean, default: false},
        reply: [
            {
                commenter: {type: Schema.Types.ObjectId, ref: "User"},
                comment: {type: String},
                likes: [{type: Schema.Types.ObjectId, ref: "User"}],
                edited: {type: Boolean, default: false},
                createdAt: {type: Date, default: Date.now()},
                updatedAt: {type: Date, default: Date.now()}
            }
        ]   
    },
    { timestamps: true }
    );

const commentModel = model("Comment", commentSchema);

export default commentModel;