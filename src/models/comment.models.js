import  mongoose , {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const commentSchema = new Schema({
    videos:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    content:{
        type:String
    },

    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }

},{timestamps:true})

commentSchema.plugin(mongooseAggregatePaginate)
const Comment = mongoose.model("Comment",commentSchema);