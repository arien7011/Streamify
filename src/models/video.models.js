import mongoose ,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new Schema({
    videoFile:{
        type:String, //cloudinary Url
    },
    title:{
        type:String
    },
    description:{
        type:string
    },
    thumbnail:{
        type:String
    },
    views:{
        type:Number,
        default:0
    },
    duration:{
        type:Number
    },
    owner:{
     type:Schema.Types.ObjectId,
     ref:"user"
    },
    isPublished:{
        type:String,
        default:true
    }
},{timeStamps:true})


videoSchema.plugin(mongooseAggregatePaginate)

const Video = mongoose.model("Video",videoSchema);