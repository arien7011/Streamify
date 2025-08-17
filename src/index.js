import app from "./app.js";
import app from "../netlify/functions/server.js"
import dotenv from "dotenv";
import connectDB from "./db/index.js";
dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 8001;

connectDB().then((response) => {
    console.log(`Database Connected`, response);
    app.listen(PORT, () => console.log(`App is listening on port ${PORT}`));
  }).catch((error)=>{
     console.log("DB connection Error",error);
  });
