import e from "express";
import cors from 'cors'
import cookieParser from 'cookie-parser'
import bodyParser from "body-parser";
import { errorHandler } from "./middlewares/ApiErrorHandler.js";

const app = e();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.use(e.urlencoded({ limit: '16kb', extended: false }))
// app.use(e.json({ limit: '16kb' }))
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))
app.use(cookieParser())
app.use(e.static('public'))

import userRoutes from './routes/user.routes.js'
import videoRoutes from './routes/videos.routes.js'
import subscriptionRoutes from './routes/subscription.routes.js'
import tweetRoutes from './routes/tweet.routes.js'
import commentRoutes from './routes/comment.routes.js'
import likeRoutes from './routes/like.routes.js'
import playlistRoutes from './routes/playlist.routes.js'

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/videos', videoRoutes);
app.use('/api/v1/subscription', subscriptionRoutes);
app.use('/api/v1/tweet', tweetRoutes);
app.use('/api/v1/comment/', commentRoutes);
app.use('/api/v1/like', likeRoutes);
app.use('/api/v1/playlist', playlistRoutes);

app.use(errorHandler);
export default app;
