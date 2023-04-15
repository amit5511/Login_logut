const OtpServices = require('../services/Otp-services')
const HashService = require('../services/hash-service')
const tokenService = require('../services/token-service')
const User = require('../models/user_model')



//configure dot env
const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });

const login = async (req, res) => {
    try {
        const { phone } = req.body

        if (!phone) {

            throw new Error("Please entre phone number !!")
        } else {
            if (phone.length != 13)
                throw new Error("Invalid phone number")

             //checking user is register or not
             let user = await User.findOne({ phone: phone });   
             if(!user)
               throw new Error("User Not Registered")
            //generate otp 
            const otp = await OtpServices.generateOtp();

            //hash otp
            //expire in 1 minutes 
            const ttl = 1000 * 60 * 1;
            const expire = Date.now() + ttl;
            const data = `${otp}`
            const hash = await HashService.hashOtp(data);

            //send otp by sms
            await  OtpServices.sendBySms(phone, otp);

            res.status(201).json({
                "success": true,
                "message": "OTP send successfully",
                "phone": phone,
                "otp":otp,
                "hash": `${hash}.${expire}`

            })
        }

    } catch (error) {
        
        res.status(401).json({
            success: false,
            message: error.message
        })
    }
}

const register = async (req, res) => {
    try {
        const { phone } = req.body

        if (!phone) {

            throw new Error("Please entre phone number !!")
        } else {
            if (phone.length != 13)
                throw new Error("Invalid phone number")

             //checking user is register or not
             let user = await User.findOne({ phone: phone });   
             if(user)
               throw new Error("User already registered")
        
            //generate otp 
            const otp = await OtpServices.generateOtp();

            //hash otp
            //expire in 1 minutes 
            const ttl = 1000*60*1;
            const expire = Date.now() + ttl;
            const data = `${otp}`
            const hash = await HashService.hashOtp(data);

            //send otp by sms
            await  OtpServices.sendBySms(phone, otp);
           
            res.status(201).json({
                "success": true,
                "message": "OTP send successfully",
                "phone": phone,
                "otp":otp,
                "hash": `${hash}.${expire}`

            })
        }

    } catch (error) {
        res.status(401).json({
            success: false,
            message: error.message
        })
    }
}

const verify_otp = async (req, res) => {
    try {
        const { phone, otp, hash } = req.body;

        if (!phone || !otp || !hash) {
            throw new Error("Please entre all fildes")
        } else {
            const [hashotp, expire] = hash.split('.');
            if (Date.now() > expire) {

                throw new Error("Time Expired");
            } else {

                const verify = await OtpServices.VerifyOtp(hashotp, otp);


                if (verify) {

                    //check user alradey register or not
                    let user = await User.findOne({ phone: phone });

                    //if user not register create new user
                    if (!user)
                        user = await User.create({ phone })

                    //now create access token and refresh token

                    //console.log(user)
                    const { accessToken } = tokenService.generateToken({ _id: user._id });
                       res.cookie('accessToken', accessToken, {
                        maxAge:1000*60*60*24*30*12,
                        httpOnly: true,
                        sameSite: process.env.dev === "development" ? true : "none",
                       secure: process.env.dev === "development" ? false : true,
                
                    })

                    res.status(201).json({
                        user,
                     
                        success: true
                    })

                } else {
                    throw new Error("Invalid OTP")

                }
            }
        }

    }
    catch (error) {
       
        res.status(501).json({
            success: false,
            isAuth: false,
            message: error.message
        })
    }
}



const add_user_details = async (req, res) => {
    try {
        const { _id } = req.user;

        const user = await User.findById(_id);
        const { name, email } = req.body;
        if(!user){
            throw new Error("User not found!!")
        }
        //console.log(req.body)
        if (!name || !email) {

            throw new Error("All fildes require");
        } else {

            user.name = name;
            user.email = email;

            await user.save();
           
            res.status(201).json({
              user,
            message: "User Details",
            success:true

            })



        }

    } catch (error) {
        res.status(401).json({
         
            success: false,
            message: error.message
        });
    }
}



const loadUser = async (req, res) => {

    try {
        
        const { _id } = req.user;
        const user = await User.findById(_id);
        res.status(201).json({
            user,
            success: true,
        })
    } catch (error) {
        // console.log(error);
        res.status(401).json({
            success: false,
            message: error.message
        });
    }
}

const logOutUser = async (req, res) => {
    try {


        res.cookie('accessToken', null, {
            expireIn: Date.now(),
            httpOnly: true,
            sameSite: process.env.dev === "development" ? true : "none",
                secure: process.env.dev === "development" ? false : true,
        })

        res.status(201).json({
            success: true,
            message: "LogOut Succesfully"
        })
       

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in Logout"
        })
    }
}




module.exports = {
    register, verify_otp, logOutUser, loadUser,login,
    add_user_details

}