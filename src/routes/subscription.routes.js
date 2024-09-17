import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
} from "../controllers/subscription.controller.js"

const router = Router();

router.post('/:channelId/subscribe', verifyJwt, toggleSubscription)
router.get('/:channelId/get-subscribers', verifyJwt, getUserChannelSubscribers)
router.get('/:subscriberId/subscribed-to', verifyJwt, getSubscribedChannels)

export default router;