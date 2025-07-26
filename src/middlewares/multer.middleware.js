import multer from "multer";

const storage = multer.diskStorage({
    destination:(req,file,cb) =>{
        cb(null,"./public/temp");
    },
    filename:function(req,file,cb){
        const uniquSuffix = Date.now() + '_' + Math.floor(Math.random() * 1E9)
          cb(null,file.originalname);
    }
})


export const Upload = multer({storage});