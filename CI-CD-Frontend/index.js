class MovieApp {
    constructor() {
        this.movies = [];
        this.filteredMovies = [];
        this.apiUrl = '/api/movies';
        
        this.init();
    }

    async init() {
        try {
            await this.fetchMovies();
            this.setupEventListeners();
            this.updateStats();
        } catch (error) {
            this.showError('Failed to initialize the application');
        }
    }

    async fetchMovies() {
        try {
            this.hideError();
            this.showLoading(true);
            
            const response = await fetch(this.apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.movies = await response.json();
            this.filteredMovies = [...this.movies];
            this.renderMovies();
            
        } catch (error) {
            console.error('Error fetching movies:', error);
            this.showError('Failed to load movies. Please check if the backend server is running.');
        } finally {
            this.showLoading(false);
        }
    }

    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });
    }

    handleSearch(query) {
        const searchTerm = query.toLowerCase().trim();
        
        if (searchTerm === '') {
            this.filteredMovies = [...this.movies];
        } else {
            this.filteredMovies = this.movies.filter(movie => 
                movie.title.toLowerCase().includes(searchTerm) ||
                movie.genre.toLowerCase().includes(searchTerm) ||
                movie.director.toLowerCase().includes(searchTerm) ||
                movie.description.toLowerCase().includes(searchTerm)
            );
        }
        
        this.renderMovies();
        this.updateStats();
    }

    renderMovies() {
        const container = document.getElementById('moviesContainer');
        container.innerHTML = '';

        if (this.filteredMovies.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; color: white; padding: 40px;">
                    <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.5;"></i>
                    <h3>No movies found</h3>
                    <p>Try adjusting your search terms</p>
                </div>
            `;
            return;
        }

        this.filteredMovies.forEach((movie, index) => {
            const movieCard = this.createMovieCard(movie, index);
            container.appendChild(movieCard);
        });
    }

    createMovieCard(movie, index) {
        const card = document.createElement('div');
        card.className = 'movie-card fade-in';
        card.style.animationDelay = `${index * 0.1}s`;

        const stars = this.generateStars(movie.rating);
        
        card.innerHTML = `
            <img src="${movie.poster}" alt="${movie.title}" class="movie-poster" 
                 onerror="this.src='https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop'">
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <div class="movie-meta">
                    <span class="movie-year">${movie.year}</span>
                    <span class="movie-genre">${movie.genre}</span>
                </div>
                <p class="movie-director">
                    <i class="fas fa-user"></i> ${movie.director}
                </p>
                <div class="movie-rating">
                    <span class="rating-stars">${stars}</span>
                    <span class="rating-number">${movie.rating}/10</span>
                </div>
                <p class="movie-description">${movie.description}</p>
            </div>
        `;

        // Add click event for movie details
        card.addEventListener('click', () => {
            this.showMovieDetails(movie);
        });

        return card;
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 10 - fullStars - (hasHalfStar ? 1 : 0);
        
        return '★'.repeat(fullStars) + 
               (hasHalfStar ? '☆' : '') + 
               '☆'.repeat(emptyStars);
    }

    showMovieDetails(movie) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            backdrop-filter: blur(10px);
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            border-radius: 20px;
            padding: 30px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
        `;

        const stars = this.generateStars(movie.rating);
        
        modalContent.innerHTML = `
            <button onclick="this.closest('.modal').remove()" 
                    style="position: absolute; top: 15px; right: 20px; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #666;">
                ×
            </button>
            <img src="${movie.poster}" alt="${movie.title}" style="width: 100%; height: 300px; object-fit: cover; border-radius: 15px; margin-bottom: 20px;">
            <h2 style="margin-bottom: 15px; color: #2d3748;">${movie.title}</h2>
            <div style="display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap;">
                <span style="background: #667eea; color: white; padding: 8px 16px; border-radius: 20px; font-size: 0.9rem;">
                    ${movie.year}
                </span>
                <span style="background: #fbbf24; color: white; padding: 8px 16px; border-radius: 20px; font-size: 0.9rem;">
                    ${movie.genre}
                </span>
            </div>
            <p style="margin-bottom: 15px; color: #718096;">
                <strong>Director:</strong> ${movie.director}
            </p>
            <div style="margin-bottom: 20px;">
                <span style="color: #fbbf24; font-size: 1.2rem;">${stars}</span>
                <span style="font-weight: 600; color: #2d3748; margin-left: 10px;">${movie.rating}/10</span>
            </div>
            <p style="line-height: 1.6; color: #4a5568;">${movie.description}</p>
        `;

        modal.appendChild(modalContent);
        modal.className = 'modal';
        document.body.appendChild(modal);

        // Close modal on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    updateStats() {
        const totalMovies = document.getElementById('totalMovies');
        const avgRating = document.getElementById('avgRating');
        const genres = document.getElementById('genres');

        totalMovies.textContent = this.filteredMovies.length;
        
        if (this.filteredMovies.length > 0) {
            const averageRating = (this.filteredMovies.reduce((sum, movie) => sum + movie.rating, 0) / this.filteredMovies.length).toFixed(1);
            avgRating.textContent = averageRating;
            
            const uniqueGenres = new Set(this.filteredMovies.map(movie => movie.genre));
            genres.textContent = uniqueGenres.size;
        } else {
            avgRating.textContent = '0.0';
            genres.textContent = '0';
        }
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        loading.style.display = show ? 'block' : 'none';
    }

    showError(message) {
        const error = document.getElementById('error');
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = message;
        error.style.display = 'block';
    }

    hideError() {
        const error = document.getElementById('error');
        error.style.display = 'none';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MovieApp();
});

// Add some nice loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});
