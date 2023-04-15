const crypto = require('crypto');
const HashService =require('../services/hash-service')

const dotenv =require("dotenv");
dotenv.config();

const smsSid=process.env.SMS_SID;
const smsAuthToken=process.env.SMS_AUTH_TOKEN;
const twilio =require('twilio')(smsSid,smsAuthToken,{
    lazyLoading:true
});



class OtpServiecs{

    async generateOtp(){

       const otp= crypto.randomInt(100000,999999);
       console.log(otp);
       return otp;
    }


   async sendBySms(phone,otp){
        return await twilio.messages.create({
            to:phone,
            from:process.env.SMS_FROM_NUMBER,
            body:`Your codershouse OTP is ${otp} and expire in 1 minutes`
        });
    }



   async VerifyOtp(hashotp,otp){
       
        const opt_hash= await HashService.hashOtp(otp);
        
        return opt_hash==hashotp;
    }
}

module.exports =new OtpServiecs();