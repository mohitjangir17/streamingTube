import { model, Schema } from "mongoose";
// import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const playlistSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        videos: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        description: {
            type: String,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
    },
    { timestamps: true }
)

export const Playlist = model('Playlist', playlistSchema);