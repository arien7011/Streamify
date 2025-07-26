import {Router} from "express";
import {registerUser,logoutUser, loginUser} from "../controllers/registerUser.controllers.js";
import {Upload} from "../middlewares/multer.middleware.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const userRouter = Router();
console.log("register routes");

userRouter.route('/register').post(Upload.fields([
    {
        name:"avatar",
        maxCount:1
    },
    {
        name:"coverImage",
        maxCount:1
    }
]),registerUser);

userRouter.route("/loginUser").post(loginUser);

userRouter.route("/logout").post(verifyJWT,logoutUser)


export default userRouter;