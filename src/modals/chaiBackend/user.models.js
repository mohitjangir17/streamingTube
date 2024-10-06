import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { ApiError } from "../../utils/ApiError.js";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true,
            lowercase: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        avatar: {
            type: String,
            required: true,

        },
        coverImage: {
            type: String,
        },
        watchHistory: [{
            id: {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        }],
        refreshToken: {
            type: String
        }
    },
    { timestamps: true }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10)
    next();
})

userSchema.methods.isPasswordCorrect = async function (password) {
    const res = await bcrypt.compare(password, this.password)
    return res

}
userSchema.methods.generateAccessToken = async function () {
    const generatedaccessToken = jwt.sign(
        {
            _id: this._id,
            email: this.email,
            fullName: this.fullName,
            username: this.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )

    return (generatedaccessToken)
}

userSchema.methods.generateRefreshToken = async function () {
    const generatedRefreshToken = await jwt.sign(
        {
            _id: this._id,
            email: this.email,
            fullName: this.fullName,
            username: this.username,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
    // console.log(generatedRefreshToken);
    return generatedRefreshToken
}

export const User = mongoose.model("User", userSchema) 