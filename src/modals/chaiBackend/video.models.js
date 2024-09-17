import mongoose, { Schema } from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videoFile: {
            type: String,
            required: true,
        },
        videoDescription: {
            type: String,
        },
        videoThumbnail: {
            type: String,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        title: {
            type: String,
            required: true
        },
        duration: {
            type: Number,
            required: true
        },
        isPublished: {
            type: Boolean,
            default: true
        },
        views: {
            type: Number,
            default: 0
        },
        publicAssetId: {
            type: String
        }
    },
    { timestamps: true }
)

videoSchema.plugin(aggregatePaginate)

export const Video = mongoose.model('Video', videoSchema);