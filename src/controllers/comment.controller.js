import mongoose, { isObjectIdOrHexString, isValidObjectId } from "mongoose"
import { Comment } from '../modals/chaiBackend/comment.models.js'
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page, limit } = req.query

    const options = {
        page: page || 1,
        limit: limit || 10,
    }

    const videoComments = await Comment
        .aggregatePaginate(Comment.aggregate([
            [
                {
                    $match: {
                        video: new mongoose.Types.ObjectId(videoId)
                    }
                },
                {
                    $sort: {
                        createdAt: -1
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "owner",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                {
                    $unwind: {
                        path: "$user"
                    }
                },
                {
                    $project: {
                        _id: 1,
                        comment: 1,
                        ownerName: "$user.fullName",
                        avatar: "$user.avatar",
                        userId: "$user._id",
                    }
                }
            ]
        ]), options)

    if (!videoComments) {
        throw new ApiError(
            401,
            "Error while fetching comments"
        )
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                videoComments,
                "comments fetched sucessfully"
            )
        )

})

const addComment = asyncHandler(async (req, res) => {
    const { comment } = req.body
    const userId = req.authorisedUser._id
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(
            401,
            "videoId is required"
        )
    }

    if (!comment) {
        throw new ApiError(
            401,
            "comment is required"
        )
    }

    const newComment = await Comment.create({
        comment,
        owner: userId,
        video: videoId
    })

    if (!newComment) {
        throw new ApiError(
            401,
            "somethng went wrong while creating comment"
        )
    }

    return res
        .status(201).json(
            new ApiResponse(200,
                newComment,
                "Comment created Successfully")
        )
})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const { comment } = req.body

    if (!comment) {
        throw new ApiError(
            401,
            "Comment is required"
        )
    }

    const updateTweet = await Comment.findByIdAndUpdate(commentId,
        {
            $set:
            {
                comment: comment
            }
        },
        {
            new: true
        }
    )

    if (!updateTweet) {
        throw new ApiError(
            401,
            "Something went wrong while updating Comment"
        )
    }

    return res
        .status(201).json(
            new ApiResponse(200,
                updateTweet,
                "Comment updated Successfully")
        )

})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    const deleteTweet = await Comment.findByIdAndDelete(commentId)

    if (!deleteTweet) {
        throw new ApiError(
            401,
            "somethng went wrong while deleting  comment"
        )
    }

    return res
        .status(201).json(
            new ApiResponse(200,
                deleteTweet,
                "Comment deleted Successfully")
        )
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}