const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ObjectId } = require("mongodb");

dotenv.config();

const app = express();

const MongoUri = process.env.MONGO_URI;
const PORT = process.env.PORT;
const DB_NAME = process.env.DB_NAME;
app.use(cors());
app.use(express.json());

const client = new MongoClient(MongoUri);

let movieCollection;

function isValidMoviePayload(body) {    
    return (
        typeof body?.title === "string" &&
        body.title.trim() &&
        typeof body?.year === "string" &&
        body.year.trim() &&
        typeof body?.genre === "string" &&
        body.genre.trim() &&
        typeof body?.movieUrl === "string" &&
        body.movieUrl.trim()
    );
}

async function startServer() {
    try {
        await client.connect();
        console.log("MongoDB connected");

        const db = client.db(DB_NAME);
        movieCollection = db.collection("movie");

        app.get("/", (req, res) => {
            res.send("Backend running");
        });
        
        app.get("/movies", async (req, res) => {
            const movies = await movieCollection.find().toArray();
            res.json(movies);
        });

        app.post("/movies", async (req, res) => {
            if (!isValidMoviePayload(req.body)) {
                return res.status(400).json({ message: "Title, year, genre, and movieUrl are required." });
            }

            const newMovie = {
                title: req.body.title.trim(),
                year: req.body.year.trim(),
                genre: req.body.genre.trim(),
                movieUrl: req.body.movieUrl.trim(),
            };
            const result = await movieCollection.insertOne(newMovie);
            const createdMovie = await movieCollection.findOne({ _id: result.insertedId });
            res.status(201).json(createdMovie);
        });
        
        app.put("/movies/:id", async (req, res) => {
            const { id } = req.params;

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ message: "Invalid movie id." });
            }

            if (!isValidMoviePayload(req.body)) {
                return res.status(400).json({ message: "Title, year, genre, and movieUrl are required." });
            }

            const updatedMovie = {
                title: req.body.title.trim(),
                year: req.body.year.trim(),
                genre: req.body.genre.trim(),
                movieUrl: req.body.movieUrl.trim(),
            };

            const result = await movieCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updatedMovie }
            );

            if (!result.matchedCount) {
                return res.status(404).json({ message: "Movie not found." });
            }

            const movie = await movieCollection.findOne({ _id: new ObjectId(id) });
            res.json(movie);
        });

        app.delete("/movies/:id", async (req, res) => {
            const { id } = req.params;

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ message: "Invalid movie id." });
            }

            const result = await movieCollection.deleteOne({ _id: new ObjectId(id) });

            if (!result.deletedCount) {
                return res.status(404).json({ message: "Movie not found." });
            }

            res.json({ message: "Movie deleted successfully." });
        });

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("Error:", error);
    }
}

startServer();
