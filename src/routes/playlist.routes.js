import { Router } from 'express';
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
} from "../controllers/playlist.controller.js"
import { verifyJwt } from "../middlewares/auth.middleware.js"

const router = Router();

router.post("/new-playlist", verifyJwt, createPlaylist)
router.get("/:userId/all", verifyJwt, getUserPlaylists)
router.get("/:playlistId", verifyJwt, getPlaylistById)
router.patch("/:playlistId/:videoId/add-to-playlist", verifyJwt, addVideoToPlaylist)
router.patch("/:playlistId/:videoId/delete-from-playlist", verifyJwt, removeVideoFromPlaylist)
router.delete("/:playlistId/delete-playlist", verifyJwt, deletePlaylist)
router.patch("/:playlistId/update-playlist", verifyJwt, updatePlaylist)

export default router