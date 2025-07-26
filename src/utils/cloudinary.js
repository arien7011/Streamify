import { v2 as cloudinary } from 'cloudinary'
import fs from "fs"
import dotenv from "dotenv";

dotenv.config({
  path: "../.env",
});
cloudinary.config({
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_SECRET_KEY
})

const uploadOnCloudinary = async (localFilePath) => {
   try{
    console.log("file path",localFilePath);
    if(!localFilePath) return null;
     const cloudinaryResponse = await cloudinary.uploader.upload(localFilePath,{resource_type:"auto"});
     if(cloudinaryResponse){
     console.log(`File upload on cloudinary .File src: ${cloudinaryResponse.url}`);
     fs.unlinkSync(localFilePath)
     return cloudinaryResponse;
     }
   }catch(error){
     fs.unlinkSync(localFilePath);
     return null;
   }
}

const deleteFileFromCloudinary = async (public_id) =>{
  if(!public_id) return null;
  return await cloudinary.uploader.destroy(public_id);
}

export  { uploadOnCloudinary, deleteFileFromCloudinary };