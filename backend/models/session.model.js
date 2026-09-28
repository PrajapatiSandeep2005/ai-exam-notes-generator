import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  refreshTokenHash: {
    type: String,
    required: [true,"refresh token is required"],
  },
  ip: {
    type: String,
    required: [true,"ip address id required"],
  },
  userAgent: {
    type: String,
    required: [true,"useragent required"],
  },
  revoke: {
    type: Boolean,
    default: false, // false = active session, true = revoked
  },
  
},{
    timestamps:true
});

const sessionModel = mongoose.model("sessions", sessionSchema);

export default sessionModel;
