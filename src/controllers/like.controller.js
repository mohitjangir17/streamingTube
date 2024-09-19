import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../modals/chaiBackend/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const userId = req.authorisedUser.id
    const isVideoLiked = await Like.find({ video: videoId, likedBy: userId })
    try {
        if (isVideoLiked == '') {
            const likeVideo = await Like.create({
                video: videoId,
                likedBy: userId
            })
            return res
                .status(201)
                .json(
                    new ApiResponse(
                        201,
                        { likeVideo, isVideoLiked: "true" },
                        "Video Liked "
                    )
                )
        } else {
            const unlike = await Like.findByIdAndDelete(isVideoLiked[0]._id)
            return res
                .status(201)
                .json(
                    new ApiResponse(
                        201,
                        { unlike, isVideoLiked: "false" },
                        "Video Unliked "
                    )
                )
        }
    } catch (error) {
        throw new ApiError(
            401,
            "Something went wrong while toggling like status"
        )
    }

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const userId = req.authorisedUser.id
    const isCommentLiked = await Like.find({ comment: commentId, likedBy: userId })
    try {
        if (isCommentLiked == '') {
            const likeComment = await Like.create({
                comment: commentId,
                likedBy: userId
            })
            return res
                .status(201)
                .json(
                    new ApiResponse(
                        201,
                        { likeComment, isCommentLiked: "true" },
                        "Comment Liked "
                    )
                )
        } else {
            const unlike = await Like.findByIdAndDelete(isCommentLiked[0]._id)
            return res
                .status(201)
                .json(
                    new ApiResponse(
                        201,
                        { unlike, isCommentLiked: "false" },
                        "Comment Unliked "
                    )
                )
        }
    } catch (error) {
        throw new ApiError(
            401,
            "Something went wrong while toggling like status"
        )
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const userId = req.authorisedUser.id
    const isTweetLiked = await Like.find({ tweet: tweetId, likedBy: userId })
    try {
        if (isTweetLiked == '') {
            const likeTweet = await Like.create({
                tweet: tweetId,
                likedBy: userId
            })
            return res
                .status(201)
                .json(
                    new ApiResponse(
                        201,
                        { likeTweet, isTweetLiked: "true" },
                        "Tweet Liked "
                    )
                )
        } else {
            const unlike = await Like.findByIdAndDelete(isTweetLiked[0]._id)
            return res
                .status(201)
                .json(
                    new ApiResponse(
                        201,
                        { unlike, isTweetLiked: "false" },
                        "Tweet Unliked "
                    )
                )
        }
    } catch (error) {
        throw new ApiError(
            401,
            "Something went wrong while toggling like status"
        )
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.authorisedUser._id
    try {
        const userLikedVideos = await Like
            .aggregatePaginate(Like.aggregate([
                [
                    {
                        $match: {
                            video: { $exists: true },
                            likedBy: new mongoose.Types.ObjectId(userId)
                        }
                    },
                    {
                        $lookup: {
                            from: "videos",
                            localField: "video",
                            foreignField: "_id",
                            as: "videos"
                        }
                    },
                    {
                        $addFields: {
                            likedVideosCount: { $size: "$videos" }
                        }
                    },
                    {
                        $unwind: {
                            path: "$videos"
                        }
                    },
                    // {
                    //     $project: {
                    //         _id: "$videos._id",
                    //         videoFile: "$videos.videoFile",
                    //         videoDescription: "$videos.videoDescription",
                    //         videoThumbnail: "$videos.videoThumbnail",
                    //         title: "$videos.title",
                    //         duration: "$videos.duration",
                    //         createdAt: "$videos.createdAt",
                    //     }
                    // }
                ]
            ]
            ))
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    userLikedVideos.docs,
                    "liked videos fetched sucessful "
                )
            )
        // res.json(userLikedVideos.docs[0].videos)
        // res.json(userLikedVideos)
        // console.log(userLikedVideos);
    } catch (error) {
        throw new ApiError(
            400,
            "Something went wrong while fetching liked videos"
        )
    }
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}