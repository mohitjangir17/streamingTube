import 'dotenv/config'
import connectDB from "./db/index.js";
import app from './app.js';
// import mongoose from 'mongoose';
// import { DB_NAME } from "./constants.js";
// const DB_NAME = require('./constants');
const port = process.env.PORT || 3000;

connectDB()
    .then(() => {

        app.on("error", (error) => {
            console.log("Error:", error);
            throw error;
        })
        app.listen(port, () => {
            console.log(`App is serving at ${port
                }`);
        })

    })

    .catch((err) => {
        console.log('Mongo error:', err);

    })

/*
(async () => {
    try {
        // await mongoose.connect(`${process.env.MONGO_URL}/chaiBackend`);
        await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`);
        app.on("error", (error) => {
            console.log("Error:", error);
            throw error;
        })
        app.listen(port, () => {
            console.log(`App is serving at ${port}, connected to mongo`);
        })
    }
    catch (error) {
        console.log("Error:", error);
        throw error
    }
})()

const jokes = [
    {
        id: '1',
        description: 'The Joke 1'
    },
    {
        id: '2',
        description: 'The Joke 2'
    },
    {
        id: '3',
        description: 'The Joke 3'
    },
]

app.get('/', (req, res) => {
    res.send('This is the Home Page');
});

app.get('/api/jokes', (req, res) => {
    res.status(200).json(jokes);
})
    */