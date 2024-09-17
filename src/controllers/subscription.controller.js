import mongoose, { isValidObjectId } from "mongoose"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Subscription } from "../modals/chaiBackend/subscription.models.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    const userId = req.authorisedUser._id
    // console.log(`channel:`, channelId, `user:`, _id);
    const isSubscribed = await Subscription.find({ subscriber: userId, channel: channelId })
    // console.log(isSubscribed[0]._id);

    try {
        if (isSubscribed == '') {
            // console.log('')
            const subscribeChannel = await Subscription.create({
                subscriber: userId,
                channel: channelId
            })
            return res
                .status(201)
                .json(
                    new ApiResponse(
                        201,
                        { subscribeChannel, isChannelSubscribed: "true" },
                        "Channel Subscribed Sucessfully "
                    )
                )
        } else {
            const unscribe = await Subscription.findByIdAndDelete(isSubscribed[0]._id)
            return res
                .status(201)
                .json(
                    new ApiResponse(
                        201,
                        { unscribe, isChannelSubscribed: "false" },
                        "Channel unsubscribed Sucessfully "
                    )
                )
        }
    } catch (error) {
        throw new ApiError(
            401,
            "Something went wrong while toggling subscribe status"
        )
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    try {
        const subscribers = await Subscription.find({ channel: channelId })

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { subscribers, 'SubscribersCount': subscribers.length },
                    "subscribers fetched sucessfully"
                )
            )
    } catch (error) {
        throw new ApiError(
            200,
            "something went wrong fetching subscribersCount"
        )
    }

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    try {
        const subscribedTo = await Subscription.find({ subscriber: subscriberId })

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { subscribedTo, 'Subscribed To': subscribedTo.length },
                    "fetched sucessfully"
                )
            )
    } catch (error) {
        throw new ApiError(
            200,
            "something went wrong while fetching data"
        )
    }
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}