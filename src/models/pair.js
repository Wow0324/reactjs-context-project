import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Basic Schema
const BasicSchema = new Schema({
    address: {
        type: String,
        default: ""
    },
    token1: {
        type: String,
        default: ""
    },
    token2: {
        type: String,
        default: ""
    },
    factory: {
        type: String,
        default: ""
    },
    chain: {
        type: String,
        default: ""
    },
    liquidity: {
        type: Number,
        default: 0
    }
});

export default mongoose.model("pair", BasicSchema);