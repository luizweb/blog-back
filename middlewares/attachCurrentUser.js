import userModel from "../models/user.model.js";

async function attachCurrentUser(req, res, next) {
    try {
        const loggedInUser = req.auth;
        const user = await userModel.findOne({ _id: loggedInUser._id }, { passwordHash: 0 });
      
        if (!user) {
            return res.status(400).json({ message: "Usuário não existe" });
        }
  
        req.currentUser = user;
  
        next();
    
    } catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
  }
  
  export default attachCurrentUser;