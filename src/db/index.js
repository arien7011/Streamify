import { DB_NAME } from "../constants.js";
import mongoose from "mongoose";

const connectDB= async() =>{
   try{ 
   const connectionInstance = await mongoose.connect(`${process.env.DB_CONNECTION_URI}/${DB_NAME}`);
    console.log(`/n Database Connection host: ${connectionInstance.connection.host}`)
   }catch(error){
    console.log('Database Connection Error',error)
    process.exit(1);
   }
}

export default connectDB;