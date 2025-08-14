require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Dummy movie data with web images
const movies = [
  {
    id: 1,
    title: 'Inception',
    year: 2010,
    genre: 'Sci-Fi',
    director: 'Christopher Nolan',
    rating: 8.8,
    poster: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400&h=600&fit=crop',
    description: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.'
  },
  {
    id: 2,
    title: 'The Matrix',
    year: 1999,
    genre: 'Action',
    director: 'Lana Wachowski',
    rating: 8.7,
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=600&fit=crop',
    description: 'A computer programmer discovers that reality as he knows it is a simulation created by machines, and joins a rebellion to break free.'
  },
  {
    id: 3,
    title: 'Interstellar',
    year: 2014,
    genre: 'Adventure',
    director: 'Christopher Nolan',
    rating: 8.6,
    poster: 'https://images.unsplash.com/photo-1446776811953-b23d0bd75bc2?w=400&h=600&fit=crop',
    description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.'
  },
  {
    id: 4,
    title: 'The Dark Knight',
    year: 2008,
    genre: 'Action',
    director: 'Christopher Nolan',
    rating: 9.0,
    poster: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.'
  },
  {
    id: 5,
    title: 'Pulp Fiction',
    year: 1994,
    genre: 'Crime',
    director: 'Quentin Tarantino',
    rating: 8.9,
    poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop',
    description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.'
  },
  {
    id: 6,
    title: 'Forrest Gump',
    year: 1994,
    genre: 'Drama',
    director: 'Robert Zemeckis',
    rating: 8.8,
    poster: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
    description: 'The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75.'
  }
];

// Routes
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to Movies API', version: '1.0.0' });
});

app.get('/api/movies', (req, res) => {
  res.json(movies);
});

app.get('/api/movies/:id', (req, res) => {
  const movie = movies.find(m => m.id === parseInt(req.params.id));
  if (!movie) {
    return res.status(404).json({ message: 'Movie not found' });
  }
  res.json(movie);
});

app.get('/api/movies/genre/:genre', (req, res) => {
  const genre = req.params.genre.toLowerCase();
  const filteredMovies = movies.filter(m => 
    m.genre.toLowerCase().includes(genre)
  );
  res.json(filteredMovies);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📽️  Movies API available at http://localhost:${PORT}/api/movies`);
});
