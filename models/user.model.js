import {Schema, model} from 'mongoose';

const userSchema = new Schema(
  {
    name: { type: String, trim: true },
    //userName: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    },
    //passwordHash: { type: String, required: true },
    profilePic: { type: String, default: "https://res.cloudinary.com/ddrdmilou/image/upload/v1672429199/blog/profilepic_ncqgkf.png" },
    role: { type: String, enum: ["ADMIN", "EDITOR", "USER"], default: "USER" },
    confirmedEmail: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    //likes: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    //responses: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    //savedPosts: [{ type: Schema.Types.ObjectId, ref: "Post" }]
  },
  { timestamps: true }
);

const userModel = model("User", userSchema);

export default userModel;