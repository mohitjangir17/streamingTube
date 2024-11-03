import { Router } from "express";
import {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
    getAllTweets
} from "../controllers/tweet.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.post('/create', verifyJwt, createTweet)
router.get('/get', getUserTweets)
router.get('/get-all', verifyJwt, getAllTweets)
router.patch('/:tweetId/u', verifyJwt, updateTweet)
router.delete('/:tweetId/d', verifyJwt, deleteTweet)

export default router;

