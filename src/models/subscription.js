import mongoose,{Schema} from "mongoose";

const subscriptionSchema = new Schema({
    channel:{
        type:Schema.Types.ObjectId, // One who subscribe the chnnel
        ref:"User"
    },
    subscriber:{
        type:Schema.Types.ObjectId ,// one whom channel subscriber is subscribing
        ref:"User"
    }
},{timestamps:true})

export const Subscription = mongoose.model("Subscription",subscriptionSchema);
