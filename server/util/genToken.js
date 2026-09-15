import jwt from 'jsonwebtoken'

export const genToken = (id)=>{
    return jwt.sign({id},process.env.jwtSec,{expiresIn:'10d'})
}