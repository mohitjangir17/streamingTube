import { model, Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const playlistSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
        },
        playlistVideos: [
            {
                _id: {
                    type: Schema.Types.ObjectId,
                    ref: "Video"
                }
            }
        ],
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
    },
    { timestamps: true }
)

playlistSchema.plugin(mongooseAggregatePaginate)
export const Playlist = model('Playlist', playlistSchema);