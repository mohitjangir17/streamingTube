import { Router } from 'express';
import {
    getLikedVideos,
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
} from "../controllers/like.controller.js"
import { verifyJwt } from "../middlewares/auth.middleware.js"

const router = Router();

router.post('/:videoId/tv', verifyJwt, toggleVideoLike)
router.post('/:commentId/tc', verifyJwt, toggleCommentLike)
router.post('/:tweetId/tt', verifyJwt, toggleTweetLike)
router.get('/liked-videos', verifyJwt, getLikedVideos)

export default router