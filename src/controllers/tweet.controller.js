import mongoose, { get, isValidObjectId } from "mongoose"
import { Tweet } from "../modals/chaiBackend/tweet.model.js"
import { User } from "../modals/chaiBackend/user.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body
    const userId = req.authorisedUser._id

    if (!content) {
        throw new ApiError(
            401,
            "content is required"
        )
    }

    const tweet = await Tweet.create({
        content,
        owner: userId
    })

    if (!tweet) {
        throw new ApiError(
            401,
            "somethng went wrong while creating tweet"
        )
    }

    return res
        .status(201).json(
            new ApiResponse(200,
                tweet,
                "Tweet created Successfully")
        )

})

const getUserTweets = asyncHandler(async (req, res) => {
    const userId = req.authorisedUser._id
    const tweetsByUser = await Tweet.find({ owner: userId })

    if (!tweetsByUser) {
        throw new ApiError(
            401,
            "somethng went wrong while fetching user tweets"
        )
    }

    return res
        .status(201).json(
            new ApiResponse(200,
                tweetsByUser,
                "Tweet fetched Successfully")
        )
})

const getAllTweets = asyncHandler(async (req, res) => {
    const getTweets = await Tweet.aggregate([
        [
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
                    content: 1,
                    ownerName: "$user.fullName",
                    email: "$user.email",
                    avatar: "$user.avatar",
                }
            }
        ]
    ])

    if (!getTweets) {
        if (!tweetsByUser) {
            throw new ApiError(
                401,
                "somethng went wrong while fetching all tweets"
            )
        }
    }

    return res
        .status(201).json(
            new ApiResponse(200,
                getTweets,
                "Tweet fetched Successfully")
        )
})

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const { content } = req.body

    if (!content) {
        throw new ApiError(
            401,
            "content is required"
        )
    }

    const updateTweet = await Tweet.findByIdAndUpdate(tweetId,
        {
            $set:
            {
                content: content
            }
        },
        {
            new: true
        }
    )

    if (!updateTweet) {
        throw new ApiError(
            401,
            "Something went wrong while updating tweet"
        )
    }

    return res
        .status(201).json(
            new ApiResponse(200,
                updateTweet,
                "Tweet updated Successfully")
        )

})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    const deleteTweet = await Tweet.findByIdAndDelete(tweetId)

    if (!deleteTweet) {
        throw new ApiError(
            401,
            "somethng went wrong while deleting  tweet"
        )
    }

    return res
        .status(201).json(
            new ApiResponse(200,
                deleteTweet,
                "Tweet deleted Successfully")
        )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
    getAllTweets
}