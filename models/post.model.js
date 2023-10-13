import {Schema, model} from 'mongoose';
import slugify from 'slugify';

const postSchema = new Schema(
    {
        title: { type: String, trim: true },        
        author: {type: Schema.Types.ObjectId, ref: "User"},
        category: [{type: String}],
        tags: [{type: String}],
        image: { type: String },   
        summary: { type: String, trim: true }, 
        text: {type: String},
        likes: [{type: Schema.Types.ObjectId, ref: "User"}],
        comments: [{type: Schema.Types.ObjectId, ref: "Comment"}],
        savedPosts: [{type: Schema.Types.ObjectId, ref: "User"}],
        active: {type: Boolean, default: true},
        slug: { type: String, 
                required: true,
                unique: true }
    },
    { timestamps: true }
    );

//slugify - 'slug' for the title
// função vai rodar sempre que houver atualização, criação, delete
postSchema.pre('validate', function(next){
    if (this.title) {
        this.slug = slugify(this.title, {
            lower: true,
            strict: true
        });
    };
    next();
})

const postModel = model("Post", postSchema);

export default postModel;