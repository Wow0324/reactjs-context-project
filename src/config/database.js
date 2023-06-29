import mongoose from "mongoose";

const ConnectDatabase = async (mongoUrl) => {
    try {
        const connectOptions = {
            autoCreate: true,
            keepAlive: true,
            retryReads: true,
        };

        const result = await mongoose.connect(mongoUrl, connectOptions);

        if (result) {
            console.log("MongoDB connected");
        }
    } catch (err) {
        console.log(err);
        ConnectDatabase(mongoUrl);
    }
};

export default ConnectDatabase;
