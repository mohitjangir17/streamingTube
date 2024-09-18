import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { fileUpload } from "../middlewares/multer.middleware.js"
import {
    publishVideo,
    getAllVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
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
router.get('/', verifyJwt, getAllVideos)
router.get('/:videoId/', verifyJwt, getVideoById)
router.patch('/:videoId/update-video', verifyJwt, fileUpload.single('videoThumbnail'), updateVideo)
router.delete('/:videoId/delete-video', verifyJwt, deleteVideo)
router.patch('/:videoId/update-publishedstatus', verifyJwt, togglePublishStatus)

export default router;