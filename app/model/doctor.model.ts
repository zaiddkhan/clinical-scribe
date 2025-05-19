import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        default: 'Doctor',
    },
    email: {
        type: String,
        default: 'nodoc@gmail.com'
    },
    phone: {
        type: String,
        default: '0000000000'
    },
    specialization: {
        type: String,
        default: 'General'
    },
    address: {
        type: String,
        default: 'No Address'
    },
    website: {
        type: String,
        default: 'No Website'
    },
    email_sent: {
        type: Boolean,
        default: false,
    }

}, { timestamps: true, versionKey: false });

// Prevent model redefinition error in development with hot reloading
const Doctor = mongoose.models.Doctor || mongoose.model("Doctor", doctorSchema);
export default Doctor;