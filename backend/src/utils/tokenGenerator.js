import jwt from "jsonwebtoken";

export const createToken = (user)  =>{
    const token = jwt.sign({_id:user._id},process.env.JWT_SECRET)
    return token
}