const router = require('express').Router();
const {register,verify_otp,
    login, 
    loadUser, logOutUser,
    add_user_details,
    
   
}=require('../controller/userController');
const authMiddleware = require('../middleware/auth-middleware');

//login signup route
router.route('/register').post(register);
router.route('/login').post(login);
router.route('/verify-otp').post(verify_otp);

//add user name and email 
router.route('/add-details').post(authMiddleware.isAuth,add_user_details);

//load user
router.route('/load-user').get(authMiddleware.isAuth,loadUser);

//logout user
router.route('/logout-user').get(logOutUser);



module.exports=router