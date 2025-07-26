import mongoose from "mongoose";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";

const errorHandler = (err,req,res,next) => {
  let error = err;
  if(!error instanceof ApiError){
    const statusCode = error.statusCode || error instanceof mongoose.Error ? 400 : 500;
    const errorMessage = error.message || "Something went Wrong";
    error = new ApiError(statusCode,errorMessage,err.errors||[],err.stack);
  }

  const response = {
    ...error,
    message:error.message,
    ...(process.env.NODE_ENV === "development" ? {stack:error.stack} : {})
  }

  response.status(statusCode).json(response);
}


export default errorHandler;