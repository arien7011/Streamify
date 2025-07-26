import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";

const healthCheckResponse = asyncHandler( async (req,res)=>{
    return res.status(200).json(new ApiResponse(200,"Ok","Health Check Successful"))
})



export default healthCheckResponse;