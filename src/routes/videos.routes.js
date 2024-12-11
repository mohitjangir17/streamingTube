import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { fileUpload } from "../middlewares/multer.middleware.js"
import {
    publishVideo,
    getAllVideos,
    getVideoById,
    videoCountInc,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getMyVideos,
    addVideoToUserHistory
} from "../controllers/video.controller.js"

const router = Router();

router.post('/publish-video',
    verifyJwt,
    fileUpload.fields([
        {
            name: "videoFile",
            maxCount: 1
        },
        {
            name: "videoThumbnail",
            maxCount: 1
        },
    ]),
    publishVideo)
router.get('/', getAllVideos)
router.get('/:id/my-videos', getMyVideos)
router.get('/:videoId/', getVideoById)
router.patch('/:videoId/countIncment', videoCountInc)
router.patch('/:userId/:videoId/addVideoToUserHistory', addVideoToUserHistory)
router.patch('/:videoId/update-video', verifyJwt, fileUpload.single('videoThumbnail'), updateVideo)
router.delete('/:videoId/delete-video', verifyJwt, deleteVideo)
router.patch('/:videoId/update-publishedstatus', verifyJwt, togglePublishStatus)

export default router;