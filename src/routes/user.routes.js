import { Router } from "express";
import {
    loginUser,
    registerUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserProfilePic,
    updateUserCoverImage,
    gerUserChannelProfile,
    getWatchHistory
} from "../controllers/user.controller.js";
import { fileUpload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.post('/register',
    fileUpload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser);
router.post('/login', loginUser)

// secured routes
router.post('/logout', verifyJwt, logoutUser)
router.get('/get-user', verifyJwt, getCurrentUser)
router.post('/refresh-token', refreshAccessToken)
router.post('/change-password', verifyJwt, changeCurrentPassword)
router.patch('/update-profile', verifyJwt, updateAccountDetails)
router.patch('/update-profile-picture', verifyJwt, fileUpload.single("avatar"), updateUserProfilePic)
router.patch('/update-cover-image', verifyJwt, fileUpload.single("coverImage"), updateUserCoverImage)
router.get('/c/:username', verifyJwt, gerUserChannelProfile)
router.get('/history', verifyJwt, getWatchHistory)


export default router;

