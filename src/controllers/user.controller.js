import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../modals/chaiBackend/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"
import mongoose, { mongo } from "mongoose"

const generateRefreshAndAccessToken = async (userId) => {
    try {
        const user = await User.findById(userId)

        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()
        // console.log("RefreshToken:", refreshToken)
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        new ApiError(500, "Something went wrong while generating Refreshing or Access Token")
    }
}

const registerUser = asyncHandler(async (req, res) => {

    const { username, email, password, fullName } = req.body
    // console.log(username, email, password, fullName, req.files?.coverImage[0], req.files?.avatar[0]);

    if ([
        fullName, email, password, username
    ].some((field) => field?.trim() === "")) {
        throw new ApiError(400, " Many fields are empty... All are reqired !!!")
    }
    const userExistingAlready = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (userExistingAlready) {
        throw new ApiError(409, "User already exists !!!")
    }

    const localFilePath = req.files?.avatar[0]?.path;
    const localCoverImagePath = await req.files?.coverImage[0]?.path;

    if (!localFilePath) {
        throw new ApiError(400, "Avatar is required !!!")
    }

    const avatarCloudinaryLink = await uploadOnCloudinary(localFilePath)
    const coverImageCloudinaryLink = await uploadOnCloudinary(localCoverImagePath)

    if (!avatarCloudinaryLink) {
        throw new ApiError(400, "Avatar cldnry link is required !!!")
    }

    const user = await User.create({
        fullName,
        email,
        password,
        username,
        avatar: avatarCloudinaryLink.url,
        coverImage: coverImageCloudinaryLink?.url || "",
    })

    const createdUser = await User.findById(user._id)
        .select("-password -refreshToken -__v");
    // console.log(createdUser)
    if (!createdUser) {
        throw new ApiError(500, "there is some issue in creating the user !!!")
    }

    res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
        // createdUser
    )
});

const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body
    // console.log(username)
    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }
    if (!password) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (!user) {
        throw new ApiError(401, "User not found")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    // console.log(isPasswordValid)
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateRefreshAndAccessToken(user._id)

    // extra step
    const loggedInUser = await User.findById(user.id)
        .select('-password -refreshToken')
    // 

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(
            new ApiResponse(
                200, {
                user: loggedInUser, accessToken
                , refreshToken
            }, "User logged in sucessfully"
            )
        )
});

const getCurrentUser = asyncHandler(async (req, res) => {
    if (!req.authorisedUser) {
        throw new ApiError(401, "Something went wrong while fetching User")
    } else {
        res.status(200)
            .json(
                new ApiResponse(
                    200,
                    req.authorisedUser,
                    "Current user fetched"
                )
            )
    }
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.authorisedUser._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true,
    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User loggedout sucessfully"))
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized  request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const tokenUser = await User.findById(decodedToken._id)
        if (!tokenUser) {
            throw new ApiError(401, "Unauthorized  request")
        }

        if (incomingRefreshToken !== tokenUser?.refreshToken) {
            throw new ApiError(401, "Refresh token expired")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, refreshToken } = await generateRefreshAndAccessToken(tokenUser._id)

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse
                (200,
                    { accessToken, refreshToken: refreshToken },
                    'Access token Refreshed'))

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body

    if (!currentPassword) {
        throw new ApiError(401, "Current password is required")
    }
    if (newPassword !== confirmPassword) {
        throw new ApiError(401, "New password did not match")
    }

    const user = await User.findById(req.authorisedUser?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(currentPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Enter correct current password")
    }

    user.password = newPassword
    user.save({ validateBeforeSave: false })

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                "Password changed sucessfully"
            )
        )

})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body
    // console.log(fullName, email)
    if (!fullName && !email) {
        throw new ApiError(400, "Update any of entries present")
    }

    const user = await User.findByIdAndUpdate(req.authorisedUser?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        { new: true }
    ).select("-password")

    res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "Account details updated!!!"
            )
        )
})

const updateUserProfilePic = asyncHandler(async (req, res) => {
    const profilePicLocalPath = req.file?.path
    if (!profilePicLocalPath) {
        throw new ApiError(
            400,
            "avatar file missing"
        )
    }

    const profilePicCldnry = await uploadOnCloudinary(profilePicLocalPath)
    if (!profilePicCldnry.url) {
        throw new ApiError(
            400,
            "Error while uploading avatar on cloudinary"
        )
    }

    const user = await User.findByIdAndUpdate(
        req.authorisedUser?._id,
        {
            $set: {
                avatar: profilePicCldnry.url
            }
        },
        { new: true }
    ).select("-password")

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "Profile Pic updated !!!"
            )
        )
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path
    // console.log(coverImageLocalPath);

    if (!coverImageLocalPath) {
        throw new ApiError(
            400,
            "Cover image file missing"
        )
    }

    const coverImageCldnry = await uploadOnCloudinary(coverImageLocalPath)
    if (!coverImageCldnry.url) {
        throw new ApiError(
            400,
            "Error while uploading cloud image on cloudinary"
        )
    }

    const user = await User.findByIdAndUpdate(
        req.authorisedUser?._id,
        {
            $set: {
                coverImage: coverImageCldnry.url
            }
        },
        { new: true }
    ).select("-password")
    console.log(user)
    return res.status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "Cover Image updated !!!"
            )
        )
})

const gerUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params
    if (!username?.trim()) {
        throw new ApiError(400, "Username Missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: { $size: "$subscribers" },
                channelsSubscribedToCount: { $size: "$subscribedTo" },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.authorisedUser._id, "$subscribers.subscriber"] }, /*need the user to be changed that is coming from params */
                        then: true,
                        else: false,
                    }
                }
            }
        },
        {
            $project: {
                fullname: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
            }
        }
    ])
    // console.log(channel)
    if (!channel?.length) {
        throw new ApiError(
            401,
            "channel does not exist"
        )
    }
    return res.status(200)
        .json(
            new ApiResponse(
                200,
                channel[0],
                'User channel fetched sucessfully'
            )
        )
})

const getWatchHistory = asyncHandler(async (req, res) => {
    const { id } = req.params
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(
                    id
                ),
            },
        },
        {
            $unwind: "$watchHistory",
        },
        {
            $sort: {
                "watchHistory.timestamp": -1
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory._id",
                foreignField: "_id",
                as: "watchHistoryData",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $unwind: "$owner"
                    }
                ],
            },
        },
        {
            $unwind: "$watchHistoryData",
        },
        {
            $project: {
                owner: "$watchHistoryData.owner",
                _id: "$watchHistoryData._id",
                title: "$watchHistoryData.title",
                description:
                    "$watchHistoryData.videoDescription",
                duration: "$watchHistoryData.duration",
                videoThumbnail:
                    "$watchHistoryData.videoThumbnail",
                videoFile: "$watchHistoryData.videoFile",
                views: "$watchHistoryData.views",
                // wholeNewid: "$watchHistory._id",
                // timestamp: '$watchHistory.timestamp'
            },
        },

    ])
    // console.log(user)
    return res.status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "watch history fetched successfully"
            )
        )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserProfilePic,
    updateUserCoverImage,
    gerUserChannelProfile,
    getWatchHistory
};
