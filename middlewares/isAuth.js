import {expressjwt} from "express-jwt";
import * as dotenv from "dotenv";

dotenv.config();

export default expressjwt({
  secret: process.env.TOKEN_SIGN_SECRET,
  algorithms: ["HS256"],
  onExpired: async (req, err) => {
    /* console.log(new Date() - err.inner.expiredAt)
    if (new Date() - err.inner.expiredAt < 5000) { 
      console.log("Não expirado")
      return;} */
    if (!err.status === "invalid_token"){
      return;
    } 
    //console.log("Expirado!")
    //console.log(err.code)
    //console.log(err.status)
    req.tokenExpired = true;
    //throw new Error('Expired Token');
  }
});