const jwt  = require('jsonwebtoken');

const dotenv =require("dotenv");
dotenv.config();


const accesstokensecreat=process.env.access_token_secret;

class TokenService{ 

     generateToken(payload){
         const accessToken =jwt.sign(payload,accesstokensecreat,{
            expiresIn:'30d'
        })
         return {accessToken};
    }

    async verifyAccessToken(token)
    {  
        return  jwt.verify(token,accesstokensecreat);
    }

}


module.exports= new TokenService();