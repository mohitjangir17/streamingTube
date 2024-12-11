import { Router } from "express";
import {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
} from "../controllers/comment.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.post('/:videoId/add-comment', verifyJwt, addComment)
router.get('/:videoId/get-comments', getVideoComments)
router.patch('/:videoId/update-comment/:commentId', verifyJwt, updateComment)
router.delete('/:videoId/delete-comment/:commentId', verifyJwt, deleteComment)

export default router;

