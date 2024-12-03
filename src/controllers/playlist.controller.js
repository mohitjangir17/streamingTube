import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from '../modals/chaiBackend/playlist.model.js'
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    const userId = req.authorisedUser._id

    if (!name && !description) {
        throw new ApiError(
            401,
            "Playlist name and description are required"
        )
    }

    const newPlaylist = await Playlist.create({
        name,
        description,
        owner: userId
    })

    if (!newPlaylist) {
        throw new ApiError(
            401,
            "some error while creating new playlist"
        )
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                201,
                newPlaylist,
                "Playlist created sucessfully"
            )
        )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    // const userId = req.authorisedUser._id
    try {
        const userPlaylists = await Playlist.find({ owner: userId })

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    userPlaylists,
                    "user Playlist fetched  "
                )
            )
    } catch (error) {
        throw new ApiError(
            400,
            "Something went wrong while fetching UserPlaylist"
        )
    }
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // console.log(playlistId);

    //TODO: get playlist by id
    try {
        const individualPlaylist = await Playlist.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(playlistId)
                }
            },
            {
                $addFields: {
                    totalVideosCount: { $size: '$playlistVideos' }
                }
            },
            {
                $lookup: {
                    from: 'videos',
                    localField: 'playlistVideos._id',
                    foreignField: '_id',
                    as: 'videoData'
                }
            },
        ])
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    individualPlaylist,
                    "individual playlist fetched "
                )
            )
    } catch (error) {
        throw new ApiError(
            400,
            "Something went wrong while fetching individual Playlist"
        )
    }
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // console.log("pid:", playlistId, 'vid:', videoId);

    const isVideoExists = await Playlist.find({
        videos: { _id: videoId }
    })
    if (isVideoExists == '') {
        const pushVideo = await Playlist.findByIdAndUpdate(playlistId,
            {
                $push: {
                    playlistVideos: {
                        $each: [{ _id: videoId }]
                    }
                }
            },
            {
                new: true
            }
        )

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    pushVideo
                )
            )
    } else {
        throw new ApiError(
            401,
            "Video Exists"
        )
    }
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    try {
        const deleteFromPlaylist = await Playlist.findByIdAndUpdate(playlistId,
            {
                $pull: {
                    playlistVideos: { _id: videoId }
                }
            },
            { new: true }
        )

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    deleteFromPlaylist,
                    "video deleted from playlist"
                )
            )
    } catch (error) {
        throw new ApiError(
            401,
            "Something went wrong while deleting from playlist"
        )
    }
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const deletePlaylist = await Playlist.findByIdAndDelete(playlistId)

    if (!deletePlaylist) {
        throw new ApiError(
            401,
            "something went wrong while deleting playlist"
        )
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                deletePlaylist,
                "playlist deleted"
            )
        )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body

    if (!name && !description) {
        throw new ApiError(
            401,
            "Playlist name and description are required"
        )
    }

    const updatePlaylist = await Playlist.findByIdAndUpdate(playlistId, {
        $set: {
            name,
            description
        }
    }, { new: true })

    if (!updatePlaylist) {
        throw new ApiError(
            401,
            "some error while updating  playlist"
        )
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                201,
                updatePlaylist,
                "Playlist updated sucessfully"
            )
        )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}