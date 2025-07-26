
/*
NOTE:
AsyncHandler is a higher order function which is taking routeHandler function as an argument ,
and then returning a function by executing the whole function using
promise(that means it executing all the code of the routeHandler and if it successfully execute)
all the code inside the routeHandler it resolve(means return the result) with response
and if it would confront or recieve error in between its execution
we will simply catching the error and  pass this error to centralised middleware function 
using next(error) which further handles it and send error response accordingly.
*/

const asyncHandler = (requestHandler) => {
    return (req,res,next) =>{
         Promise.resolve(requestHandler(req,res,next)).catch((error)=>{
           next(error);
        })
    }
} 



export default asyncHandler

