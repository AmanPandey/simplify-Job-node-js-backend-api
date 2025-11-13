import mongoose from "mongoose";

const employersSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    company_name: {
      type: String,
      required: true,
      trim: true,
    },
    company_size: {
      type: String,
      enum: ["1-10", "11-50", "51-200", "201-500", "500+"],
      required: true,
    },
    industry: {
      type: String,
      required: true,
      trim: true,
    },
    company_location: {
      type: String,
      required: true,
      trim: true,
    },
    company_website: {
      type: String,
      trim: true,
    },
    contact_number: {
      type: String,
      trim: true,
    },
    // company_logo: {
    //   type: String,
    //   required: true,
    // },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Employers = mongoose.model("Employers", employersSchema);
export default Employers;
