import mongoose, {Schema} from "mongoose"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const userSchema = new Schema({
    userName:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true,
        
    },
    email: {
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    fullname:{
        type:String,
        required:true,
        trim:true,
        index:true
    },
    password:{
        type:String,
        required:[true,"Password is required"],
    },
    watchHistory:{
        type: Schema.Types.ObjectId,
        ref:"Video"
    },
    refreshToken: {
        type:String,
    },
    avatar:{
        type:String, //cloudinary url
        required:true
    },
    coverImage: {
        type:String //cloudinary url
    },

},{timestamps:true})

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password,10);
    next();
})

userSchema.methods.isPasswordCorrect = async function (password){
  return await bcrypt.compare(this.password,password);
}

userSchema.methods.createAccessToken = async function(){
 return  jwt.sign(
    {
       _id:this._id,
       username: this.userName,
       fullName : this.fullName,
       email:this.email
    },
    process.env.ACCESS_TOKEN_SECRET,
     { expiresIn:  process.env.ACCESS_TOKEN_EXPIRY }
  )
}

userSchema.methods.createRefreshToken = async function (){
   return jwt.sign(
        {
          _id:this._id
        },
        process.env.RERESH_TOKEN_SECRET,
       {expiresIn:process.env.RERESH_TOKEN_EXPIRY}
    )
}


export const User = mongoose.model("User",userSchema)