import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.DATABASE, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // optional: writeConcern: { w: "majority", j: true },
    });

    console.log(`\nMongoDB connected !! DB HOST: `, connectionInstance.connection.host);
  } catch (error) {
    console.log("MONGODB connection error ", error);
    process.exit(1);
  }
};

export default connectDB;
