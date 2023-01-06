import express from "express";
import uploadImg from "../config/cloudinary.config.js"

const uploadRoute = express.Router();

uploadRoute.post("/img", uploadImg.single("picture"), (req, res) => {
  console.log(req.file)
  if (!req.file) {
    return res.status(400).json({ msg: 'Upload failed!' })
  }
  return res.status(201).json({ url: req.file.path })
});

export default uploadRoute;