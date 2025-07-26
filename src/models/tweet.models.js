import mongoose , {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const tweetSchema =  new Schema({
   video:{
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
},{timestamps:true}
)

export const Tweet = mongoose.model("Tweet",tweetSchema);