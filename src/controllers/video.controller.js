import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadOnCloudinary, deleteVideoFromCloudinary } from "../utils/cloudinary.js"
import { Video } from "../modals/chaiBackend/video.models.js"

const publishVideo = asyncHandler(async (req, res) => {
    const { title, videoDescription } = req.body
    const loggedInUserId = req.authorisedUser?._id

    if (!title) {
        throw new ApiError(
            400,
            "Video title is required"
        )
    }

    const localFilesPath = req.files

    if (!localFilesPath.videoFile) {
        throw new ApiError(
            400,
            "Video file is required"
        )
    }

    const thumbnailLocalPath = (() => {
        return !localFilesPath.videoThumbnail ? "" : localFilesPath.videoThumbnail[0].path
    })();

    const uploadVideoOverCloudinary = await uploadOnCloudinary(localFilesPath?.videoFile[0].path)

    const uploadVideoThumbnailOverCloudinary = await uploadOnCloudinary(
        thumbnailLocalPath
    )

    if (!uploadVideoOverCloudinary) {
        throw new ApiError(
            400,
            "Something went wrong while uploading video over cloudinary"
        )
    }

    const video = await Video.create({
        videoFile: uploadVideoOverCloudinary.url,
        videoDescription: !videoDescription ? "" : videoDescription,
        owner: loggedInUserId,
        title: title,
        duration: uploadVideoOverCloudinary.duration,
        publicAssetId: uploadVideoOverCloudinary.public_id,
        videoThumbnail: !uploadVideoThumbnailOverCloudinary ? '' : uploadVideoThumbnailOverCloudinary.url
    })

    if (!video) {
        throw new ApiError(
            400,
            "Something went wrong while uploading video over Database"
        )
    }

    return res.
        status(201)
        .json(
            new ApiResponse(
                201,
                video,
                "Video published Successfully"
            )
        )
})

const getAllVideos = asyncHandler(async (req, res) => {
    // console.log(req.authorisedUser);

    const options = {
        page: 1,
        limit: 10,
        sort: { createdAt: - 1, }

    }
    Video
        .aggregatePaginate(Video.aggregate(), options)
        .then((results) => {
            res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        results,
                        'page data fetched sucessfully'
                    )
                )
        })
        .catch((err) => {
            throw new ApiError(
                401,
                "Something went wrong fetching page data"
            )
        });
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const requestedVideo = await Video.findById(videoId)
    if (!requestedVideo) {
        throw new ApiError(
            401,
            "unable to find the video with this id"
        )
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                requestedVideo,
                "Video fetched sucessfully"
            )
        )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(400, "Could not get video id")
    }

    const { videoDescription, title } = req.body
    if (!videoDescription && !title) {
        throw new ApiError(400, "Update any of entries present")
    }

    const videoThumbnailPath = req.file?.path
    if (!videoThumbnailPath) {
        const video = await Video.findByIdAndUpdate(videoId,
            {
                $set: {
                    title,
                    videoDescription,
                }
            },
            { new: true }
        ).select(' -owner -createdAt')

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    video,
                    "Video details updated!!!"
                )
            )
    } else {
        const videoThumbnailCldnryLink = await uploadOnCloudinary(videoThumbnailPath)
        if (!videoThumbnailCldnryLink.url) {
            throw new ApiError(
                400,
                "Error while uploading cloud image on cloudinary"
            )
        }
        // console.log(`Link:`, videoThumbnailCldnryLink)
        const video = await Video.findByIdAndUpdate(videoId,
            {
                $set: {
                    title,
                    videoDescription,
                    videoThumbnail: videoThumbnailCldnryLink.url
                }
            },
            { new: true }
        ).select(' -owner -createdAt')

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    video,
                    "Video details updated!!!"
                )
            )
    }
})

const deleteVideo = asyncHandler(async (req, res) => {
    const video = await Video.findById(req.params.videoId)

    if (!video) {
        throw new ApiError(
            401,
            "unable to find the video with this id"
        )
    }

    if (video.publicAssetId) {
        const deletedVideofromCloudinaryServer = await deleteVideoFromCloudinary(video.publicAssetId)
        if (!deletedVideofromCloudinaryServer) {
            throw new ApiError(
                401,
                "error while deleting video over server"
            )
        } else {
            const deletedVideo = await Video.findByIdAndDelete(video)
            if (!deletedVideo) {
                throw new ApiError(
                    401,
                    "Video did not exist"
                )
            }

            return res
                .status(201)
                .json(
                    new ApiResponse(
                        201,
                        { deletedVideo, deletedVideofromCloudinaryServer },
                        "Video deleted sucessfully"
                    )
                )
        }
    } else {
        const deletedVideo = await Video.findByIdAndDelete(video._id)
        if (!deletedVideo) {
            throw new ApiError(
                401,
                "Video did not exist"
            )
        }

        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    { deletedVideo },
                    "Video deleted sucessfully"
                )
            )
    }
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(
            401,
            "unable to find the video id"
        )
    }

    const video = await Video.findById(videoId)
    if (!videoId) {
        throw new ApiError(
            401,
            "unable to find the video with this id"
        )
    }

    video.isPublished = !video.isPublished
    const updatedState = await video.save()

    if (!updatedState) {
        throw ApiError(
            201,
            "unable to update the published state"
        )

    } else {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    201,
                    updatedState,
                    'Flag updated!!!'
                )
            )
    }
})

export {
    publishVideo,
    getAllVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}