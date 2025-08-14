# 🎬 Movies API Application

A beautiful movie collection application built with Express.js backend and vanilla JavaScript frontend.

## ✨ Features

- **Backend API**: Express.js server with RESTful endpoints
- **Movie Data**: Dummy movie data with real images from Unsplash
- **Frontend**: Modern, responsive design with search functionality
- **Interactive**: Click on movie cards to see detailed information
- **Search**: Filter movies by title, genre, director, or description
- **Statistics**: Real-time stats showing total movies, average rating, and genres

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd CI-CD-Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory:
   ```env
   PORT=3000
   ```

4. Start the server:
   ```bash
   npm start
   ```

   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

   The server will start at `http://localhost:3000`

### Frontend Setup

1. Open the `CI-CD-Frontend/index.html` file in your web browser
2. The frontend will automatically fetch data from the backend API
3. Make sure the backend server is running before opening the frontend

## 📡 API Endpoints

- `GET /` - Welcome message
- `GET /api/movies` - Get all movies
- `GET /api/movies/:id` - Get movie by ID
- `GET /api/movies/genre/:genre` - Get movies by genre

## 🎨 Frontend Features

- **Responsive Design**: Works on desktop and mobile devices
- **Search Functionality**: Real-time search across all movie fields
- **Movie Cards**: Beautiful hover effects and animations
- **Modal Details**: Click any movie card to see full details
- **Statistics Dashboard**: Shows total movies, average rating, and genre count
- **Loading States**: Smooth loading animations and error handling

## 🛠️ Technologies Used

### Backend
- **Express.js** - Web framework
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Frontend
- **Vanilla JavaScript** - No frameworks, pure JS
- **CSS3** - Modern styling with gradients and animations
- **Font Awesome** - Icons
- **Google Fonts** - Typography

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🔧 Customization

### Adding More Movies
Edit the `movies` array in `CI-CD-Backend/index.js` to add more movies:

```javascript
{
  id: 7,
  title: 'Your Movie Title',
  year: 2024,
  genre: 'Your Genre',
  director: 'Director Name',
  rating: 8.5,
  poster: 'https://your-image-url.com/image.jpg',
  description: 'Movie description here'
}
```

### Changing the Port
Modify the `.env` file or change the default port in `index.js`:

```javascript
const PORT = process.env.PORT || 3000;
```

## 🚨 Troubleshooting

### Frontend Can't Connect to Backend
1. Ensure the backend server is running
2. Check that the port in the frontend matches the backend
3. Verify CORS is properly configured

### Images Not Loading
1. Check your internet connection
2. The app includes fallback images for failed loads
3. You can replace image URLs with your own

### Port Already in Use
Change the port in the `.env` file or use a different port:

```bash
PORT=3001 npm start
```

## 📄 License

This project is open source and available under the [ISC License](LICENSE).

## 🤝 Contributing

Feel free to contribute by:
- Adding new features
- Improving the design
- Fixing bugs
- Adding more movies to the database

---

**Happy Coding! 🎬✨**
