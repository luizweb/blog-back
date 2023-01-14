import jwt from "jsonwebtoken";

const generateToken = (user) => {

    const { _id, name, email, profilePic, role } = user;
	const signature = process.env.TOKEN_SIGN_SECRET;
    const expiration = "24h";
    
    return jwt.sign({ _id, name, email, profilePic, role }, signature, {expiresIn: expiration});
};

export default generateToken;