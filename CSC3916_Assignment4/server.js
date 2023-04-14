const express = require('express');
const jwt = require('jsonwebtoken');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 3000;
const mongo_uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const mongo_client = new MongoClient(mongo_uri, { useUnifiedTopology: true });

app.use(express.json());

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// GET /movies
// If reviews query parameter is true, include reviews
app.get('/movies', async (req, res) => {
  const client = await mongo_client.connect();
  const db = client.db('movies');

  let movies = await db.collection('movies').find().toArray();

  if (req.query.reviews === 'true') {
    movies = await Promise.all(movies.map(async (movie) => {
      const reviews = await db.collection('reviews').find({ movieId: movie._id }).toArray();
      movie.reviews = reviews;
      return movie;
    }));
  }

  res.json(movies);
});

// GET /movies/:id
// If reviews query parameter is true, include reviews
app.get('/movies/:id', async (req, res) => {
  const client = await mongo_client.connect();
  const db = client.db('movies');

  const movie = await db.collection('movies').findOne({ _id: new ObjectId(req.params.id) });

  if (movie) {
    if (req.query.reviews === 'true') {
      const reviews = await db.collection('reviews').find({ movieId: movie._id }).toArray();
      movie.reviews = reviews;
    }

    res.json(movie);
  } else {
    res.status(404).send('Movie not found');
  }
});

// POST /reviews
app.post('/reviews', authenticateToken, async (req, res) => {
  const client = await mongo_client.connect();
  const db = client.db('movies');

  const { movieId, review, rating } = req.body;
  const username = req.user.username;

  const reviewObj = {
    movieId: new ObjectId(movieId),
    username,
    review,
    rating: parseInt(rating)
  };

  await db.collection('reviews').insertOne(reviewObj);

  res.json({ message: 'Review created!' });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
