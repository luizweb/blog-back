import {Schema, model} from 'mongoose';

const userSchema = new Schema(
  {
    name: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    },
    passwordHash: { type: String, required: true },
    profilePic: { type: String, default: "https://res.cloudinary.com/ddrdmilou/image/upload/v1672429199/blog/profilepic_ncqgkf.png" },
    role: { type: String, enum: ["ADMIN", "EDITOR", "USER"], default: "USER" },
    birth: {type: String},
    gender: {type: String, enum: ["Feminino", "Masculino", "Não informado"], default: "Não informado" },
    state: {type: String},
    city: {type: String},
    confirmedEmail: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    likes: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    comment: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    savedPosts: [{ type: Schema.Types.ObjectId, ref: "Post" }]
  },
  { timestamps: true }
);

const userModel = model("User", userSchema);

export default userModel;