// ===========================
// USER MANAGEMENT SYSTEM
// ===========================

class UserManager {
    constructor() {
        this.currentUser = this.getCurrentUser();
    }
    
    // Create new user account
    createUser(username, email, password) {
        const users = JSON.parse(localStorage.getItem("users")) || {};
        const normalizedEmail = String(email || "").trim().toLowerCase();
        const existingEmail = Object.keys(users).find(key => key.toLowerCase() === normalizedEmail);
        
        if (existingEmail) {
            return { success: false, message: "Email already registered" };
        }
        
        const user = {
            id: Date.now(),
            username: username,
            email: normalizedEmail,
            password: password,
            joinDate: new Date().toLocaleDateString(),
            bio: "",
            avatar: username.charAt(0).toUpperCase(),
            watchlist: [],
            watched: [],
            lists: [],
            favorites: [],
            ratings: {},
            reviews: {},
            movieRecords: {},
            privacy: "public",
            likes: [],
            tags: [],
            following: [],
            followers: [],
            activity: [],
            diary: []
        };
        
        users[normalizedEmail] = user;
        localStorage.setItem("users", JSON.stringify(users));
        
        return { success: true, message: "Account created successfully" };
    }
    
    // Login user
    login(email, password) {
        const users = JSON.parse(localStorage.getItem("users")) || {};
        const normalizedEmail = String(email || "").trim().toLowerCase();
        const userKey = Object.keys(users).find(key => key.toLowerCase() === normalizedEmail);
        const user = userKey ? users[userKey] : null;
        
        if (!user || user.password !== password) {
            return { success: false, message: "Invalid email or password" };
        }

        user.email = normalizedEmail;
        user.watchlist = user.watchlist || [];
        user.watched = user.watched || [];
        user.lists = user.lists || [];
        user.ratings = user.ratings || {};
        user.likes = user.likes || [];
        user.tags = user.tags || [];
        user.movieRecords = user.movieRecords || {};
        user.following = user.following || [];
        user.followers = user.followers || [];
        users[normalizedEmail] = user;
        if (userKey !== normalizedEmail) delete users[userKey];
        localStorage.setItem("users", JSON.stringify(users));
        
        localStorage.setItem("currentUser", JSON.stringify(user));
        this.currentUser = user;
        
        return { success: true, message: "Login successful", user: user };
    }
    
    // Get current user
    getCurrentUser() {
        const user = localStorage.getItem("currentUser");
        return user ? JSON.parse(user) : null;
    }
    
    // Logout
    logout() {
        localStorage.removeItem("currentUser");
        sessionStorage.removeItem("ownerAccess");
        this.currentUser = null;
    }
    
    // Update user profile
    updateProfile(updates) {
        if (!this.currentUser) return false;
        
        const users = JSON.parse(localStorage.getItem("users")) || {};
        const previousEmail = this.currentUser.email;
        const nextEmail = updates.email || previousEmail;
        if (nextEmail !== previousEmail && users[nextEmail]) {
            return false;
        }
        this.currentUser = { ...this.currentUser, ...updates };
        delete users[previousEmail];
        users[this.currentUser.email] = this.currentUser;
        
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("currentUser", JSON.stringify(this.currentUser));
        
        return true;
    }

    followUser(targetUserId) {
        if (!this.currentUser || String(this.currentUser.id) === String(targetUserId)) return false;

        const users = JSON.parse(localStorage.getItem("users")) || {};
        const targetEntry = Object.entries(users).find(([, user]) => String(user.id) === String(targetUserId));
        if (!targetEntry) return false;

        const targetUser = targetEntry[1];
        this.currentUser.following = this.currentUser.following || [];
        targetUser.followers = targetUser.followers || [];
        if (this.currentUser.following.some(id => String(id) === String(targetUserId))) return false;

        this.currentUser.following.push(targetUser.id);
        targetUser.followers.push(this.currentUser.id);
        users[this.currentUser.email] = this.currentUser;
        users[targetEntry[0]] = targetUser;
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("currentUser", JSON.stringify(this.currentUser));
        return true;
    }

    unfollowUser(targetUserId) {
        if (!this.currentUser) return false;

        const users = JSON.parse(localStorage.getItem("users")) || {};
        const targetEntry = Object.entries(users).find(([, user]) => String(user.id) === String(targetUserId));
        if (!targetEntry) return false;

        const targetUser = targetEntry[1];
        this.currentUser.following = (this.currentUser.following || []).filter(id => String(id) !== String(targetUserId));
        targetUser.followers = (targetUser.followers || []).filter(id => String(id) !== String(this.currentUser.id));
        users[this.currentUser.email] = this.currentUser;
        users[targetEntry[0]] = targetUser;
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("currentUser", JSON.stringify(this.currentUser));
        return true;
    }
    
    // Add movie to watchlist
    addToWatchlist(movieId, movieData) {
        if (!this.currentUser) return false;

        this.currentUser.watchlist = this.currentUser.watchlist || [];
        this.currentUser.movieRecords = this.currentUser.movieRecords || {};
        if (movieData) this.currentUser.movieRecords[movieId] = movieData;

        if (!this.currentUser.watchlist.includes(movieId)) {
            this.currentUser.watchlist.push(movieId);
            this.updateProfile({ watchlist: this.currentUser.watchlist, movieRecords: this.currentUser.movieRecords });
            return true;
        }
        this.updateProfile({ movieRecords: this.currentUser.movieRecords });
        return false;
    }
    
    // Remove from watchlist
    removeFromWatchlist(movieId) {
        if (!this.currentUser) return false;
        
        this.currentUser.watchlist = this.currentUser.watchlist.filter(id => id !== movieId);
        this.updateProfile({ watchlist: this.currentUser.watchlist });
        return true;
    }
    
    // Add to watched
    addToWatched(movieId, movieData) {
        if (!this.currentUser) return false;

        this.currentUser.watched = this.currentUser.watched || [];
        this.currentUser.movieRecords = this.currentUser.movieRecords || {};
        if (movieData) this.currentUser.movieRecords[movieId] = movieData;

        if (!this.currentUser.watched.includes(movieId)) {
            this.currentUser.watched.push(movieId);
            this.updateProfile({ watched: this.currentUser.watched, movieRecords: this.currentUser.movieRecords });
            return true;
        }
        this.updateProfile({ movieRecords: this.currentUser.movieRecords });
        return false;
    }
    
    // Rate movie
    rateMovie(movieId, rating) {
        if (!this.currentUser) return false;
        
        this.currentUser.ratings[movieId] = rating;
        this.updateProfile({ ratings: this.currentUser.ratings });
        return true;
    }
    
    // Create personal list
    createList(name, description) {
        if (!this.currentUser) return false;
        
        const list = {
            id: Date.now(),
            name: name,
            description: description,
            movies: [],
            createdDate: new Date().toLocaleDateString(),
            isPrivate: false
        };
        
        this.currentUser.lists.push(list);
        this.updateProfile({ lists: this.currentUser.lists });
        return list;
    }
    
    // Add movie to personal list
    addMovieToList(listId, movieId) {
        if (!this.currentUser) return false;
        
        const list = this.currentUser.lists.find(l => l.id === listId);
        if (list && !list.movies.includes(movieId)) {
            list.movies.push(movieId);
            this.updateProfile({ lists: this.currentUser.lists });
            return true;
        }
        return false;
    }
}

// Initialize User Manager
const userManager = new UserManager();

let pendingMessageConfirm = null;

function showMessageDialog(message) {
    pendingMessageConfirm = null;
    let dialog = document.getElementById("appMessageDialog");

    if (!dialog) {
        dialog = document.createElement("div");
        dialog.id = "appMessageDialog";
        dialog.className = "app-message-dialog";
        dialog.innerHTML = `
            <div class="app-message-content" role="dialog" aria-modal="true" aria-labelledby="appMessageText">
                <p id="appMessageText"></p>
                <div class="app-message-actions">
                    <button type="button" class="primary-btn" data-message-ok onclick="confirmMessageDialog()">OK</button>
                    <button type="button" class="secondary-btn" data-message-cancel onclick="cancelMessageDialog()">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);
        dialog.addEventListener("click", event => {
            if (event.target === dialog) closeMessageDialog();
        });
    }

    dialog.querySelector("#appMessageText").textContent = message;
    dialog.classList.add("is-visible");
    dialog.setAttribute("aria-hidden", "false");
}

function closeMessageDialog() {
    const dialog = document.getElementById("appMessageDialog");
    if (!dialog) return;

    dialog.classList.remove("is-visible");
    dialog.setAttribute("aria-hidden", "true");
    pendingMessageConfirm = null;
}

function cancelMessageDialog() {
    closeMessageDialog();
}

function showConfirmDialog(message, onConfirm) {
    pendingMessageConfirm = typeof onConfirm === "function" ? onConfirm : null;
    showMessageDialog(message);
    pendingMessageConfirm = typeof onConfirm === "function" ? onConfirm : null;
}

function confirmMessageDialog() {
    const confirmAction = pendingMessageConfirm;
    closeMessageDialog();
    if (confirmAction) confirmAction();
}

window.alert = showMessageDialog;

const movies = [
    {
        id: 1,
        title: "Interstellar",
        year: 2014,
        rating: 4.4,
        genre: "Sci-Fi",
        director: "Christopher Nolan",
        duration: "169 min",
        plot: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
        poster: "assets/images/Interstellar Poster.jfif",
        reviews: 2841
    },
    {
        id: 2,
        title: "Inception",
        year: 2010,
        rating: 4.3,
        genre: "Sci-Fi",
        director: "Christopher Nolan",
        duration: "148 min",
        plot: "A skilled thief who steals corporate secrets through dream-sharing technology.",
        poster: "assets/images/Inception.jfif",
        reviews: 3156
    },
    {
        id: 3,
        title: "The Dark Knight",
        year: 2008,
        rating: 4.5,
        genre: "Action",
        director: "Christopher Nolan",
        duration: "152 min",
        plot: "When the menace known as the Joker emerges from his mysterious past, he wreaks havoc on Gotham.",
        poster: "assets/images/THE DARK KNIGHT.png",
        reviews: 4203
    },
    {
        id: 4,
        title: "Parasite",
        year: 2019,
        rating: 4.3,
        genre: "Drama",
        director: "Bong Joon-ho",
        duration: "132 min",
        plot: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
        poster: "assets/images/Parasite poster.jfif",
        reviews: 3542
    },
    {
        id: 5,
        title: "The Matrix",
        year: 1999,
        rating: 4.4,
        genre: "Sci-Fi",
        director: "Lana Wachowski, Lilly Wachowski",
        duration: "136 min",
        plot: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
        poster: "assets/images/Interstellar Poster.jfif",
        reviews: 2976
    },
    {
        id: 6,
        title: "Pulp Fiction",
        year: 1994,
        rating: 4.3,
        genre: "Crime",
        director: "Quentin Tarantino",
        duration: "154 min",
        plot: "The lives of two mob hitmen, a boxer, a gangster's wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
        poster: "assets/images/Inception.jfif",
        reviews: 2654
    },
    {
        id: 7,
        title: "Forrest Gump",
        year: 1994,
        rating: 4.4,
        genre: "Drama",
        director: "Robert Zemeckis",
        duration: "142 min",
        plot: "The presidencies of Kennedy and Johnson unfold from the perspective of an Alabama man with an IQ of 75.",
        poster: "assets/images/THE DARK KNIGHT.png",
        reviews: 2845
    },
    {
        id: 8,
        title: "The Shawshank Redemption",
        year: 1994,
        rating: 4.5,
        genre: "Drama",
        director: "Frank Darabont",
        duration: "142 min",
        plot: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
        poster: "assets/images/Parasite poster.jfif",
        reviews: 3198
    },
    {
        id: 9,
        title: "Gladiator",
        year: 2000,
        rating: 4.3,
        genre: "Action",
        director: "Ridley Scott",
        duration: "155 min",
        plot: "A former Roman General sets out to exact vengeance against the Emperor who wronged him.",
        poster: "assets/images/Interstellar Poster.jfif",
        reviews: 2734
    },
    {
        id: 10,
        title: "The Lion King",
        year: 1994,
        rating: 4.2,
        genre: "Animation",
        director: "Roger Allers, Rob Minkoff",
        duration: "88 min",
        plot: "Lion prince Simba and his father are targeted by his bitter uncle, who wants to ascend the throne himself.",
        poster: "assets/images/Inception.jfif",
        reviews: 2421
    },
    {
        id: 11,
        title: "Avatar",
        year: 2009,
        rating: 4.3,
        genre: "Sci-Fi",
        director: "James Cameron",
        duration: "162 min",
        plot: "A paraplegic Marine dispatched to the moon Pandora on a unique mission becomes torn between following his orders and protecting the world.",
        poster: "assets/images/THE DARK KNIGHT.png",
        reviews: 3267
    },
    {
        id: 12,
        title: "Titanic",
        year: 1997,
        rating: 4.2,
        genre: "Drama",
        director: "James Cameron",
        duration: "194 min",
        plot: "A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.",
        poster: "assets/images/Parasite poster.jfif",
        reviews: 2189
    }
];

let tvMazeMovieCatalog = [];

function normalizeGenreKey(value) {
    const normalized = String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "")
        .trim();

    return normalized === "scifi" ? "sciencefiction" : normalized;
}

function getActiveMovies() {
    return tvMazeMovieCatalog.length ? tvMazeMovieCatalog : movies;
}

async function fetchTVMazeMovieCatalog() {
    if (tvMazeMovieCatalog.length) return tvMazeMovieCatalog;

    try {
        const response = await fetch("https://api.tvmaze.com/shows");
        if (!response.ok) throw new Error("TVMaze catalog request failed");

        const shows = await response.json();
        const formatted = shows
            .filter(show => show && show.name)
            .map(show => ({
                id: show.id,
                tvmazeId: show.id,
                title: show.name,
                year: Number(show.premiered ? show.premiered.slice(0, 4) : show.ended ? show.ended.slice(0, 4) : 0),
                rating: Number(show.rating?.average ?? 0),
                genre: Array.isArray(show.genres) && show.genres.length ? show.genres.join(", ") : "Series",
                director: show.network?.name || "TVMaze",
                duration: show.runtime ? `${show.runtime} min` : "N/A",
                plot: stripHtml(show.summary || "No plot description available yet."),
                poster: show.image?.original || show.image?.medium || "assets/images/Inception.jfif",
                reviews: Math.max(100, Math.round((Number(show.rating?.average) || 4) * 220))
            }))
            .filter(item => item.title && item.poster)
            .sort((a, b) => (b.rating || 0) - (a.rating || 0));

        if (formatted.length) {
            tvMazeMovieCatalog = formatted;
        }
    } catch (error) {
        console.warn("TVMaze film catalog failed. Using local list.", error);
        tvMazeMovieCatalog = [];
    }

    return tvMazeMovieCatalog.length ? tvMazeMovieCatalog : movies;
}


// ===========================
// POPULATE TRENDING MOVIES (HOME PAGE)
// ===========================

async function fetchTrendingTVMazeShows() {
    try {
        const response = await fetch("https://api.tvmaze.com/shows");
        if (!response.ok) throw new Error("TVMaze request failed");

        const shows = await response.json();
        const filtered = shows
            .filter(show => show && show.name && (show.image || show.summary))
            .map(show => ({
                id: show.id,
                tvmazeId: show.id,
                title: show.name,
                year: Number(show.premiered ? show.premiered.slice(0, 4) : show.ended ? show.ended.slice(0, 4) : 0),
                rating: Number(show.rating?.average ?? 0),
                genre: Array.isArray(show.genres) && show.genres.length ? show.genres.join(", ") : "Series",
                director: show.network?.name || "TVMaze",
                duration: show.runtime ? `${show.runtime} min` : "N/A",
                plot: stripHtml(show.summary || "No plot description available yet."),
                poster: show.image?.original || show.image?.medium || "assets/images/Inception.jfif",
                reviews: Math.max(100, Math.round((Number(show.rating?.average) || 4) * 220))
            }))
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 12);

        if (filtered.length) return filtered;
    } catch (error) {
        console.warn("TVMaze trending fetch failed, using local movie list instead.", error);
    }

    return movies.slice(0, 12);
}

async function populateHeroSeries() {
    const hero = document.querySelector(".hero");
    const backdrop = document.querySelector(".hero-series-backdrop");
    const title = document.getElementById("heroSeriesTitle");
    const meta = document.getElementById("heroSeriesMeta");
    const seriesCard = document.querySelector(".hero-series-card");
    if (!hero || !backdrop || !title || !meta || !seriesCard) return;

    const catalog = await fetchTVMazeMovieCatalog();
    const newestSeries = [...catalog]
        .filter(series => series.poster && series.title)
        .sort((first, second) => (Number(second.year) || 0) - (Number(first.year) || 0))
        .slice(0, 10);

    if (!newestSeries.length) return;

    let currentIndex = 0;
    const showSeries = series => {
        seriesCard.classList.add("is-changing");
        backdrop.classList.remove("is-visible");

        window.setTimeout(() => {
            backdrop.style.backgroundImage = `url("${series.poster}")`;
            title.textContent = series.title;
            meta.textContent = `${series.year || "New"} · ${series.genre || "Series"}`;
            backdrop.classList.add("is-visible");
            seriesCard.classList.remove("is-changing");
        }, 500);
    };

    showSeries(newestSeries[currentIndex]);
    window.setInterval(() => {
        currentIndex = (currentIndex + 1) % newestSeries.length;
        showSeries(newestSeries[currentIndex]);
    }, 7000);
}

function renderTrendingMovieCards(movieList) {
    const trendingMovies = document.getElementById("trendingMovies");
    if (!trendingMovies || !Array.isArray(movieList) || movieList.length === 0) return;

    const visibleMovies = movieList.slice(0, 4);
    trendingMovies.innerHTML = "";

    visibleMovies.forEach(movie => {
        const movieCard = document.createElement("div");
        movieCard.classList.add("movie-card");
        movieCard.innerHTML = `
            <div class="poster">
                <img
                    src="${movie.poster}"
                    alt="${movie.title}"
                >
                <div class="movie-overlay">
                    <div class="movie-info">
                        <p class="movie-genre">${movie.genre}</p>
                        <p class="movie-year">${movie.year}</p>
                        <div class="movie-rating">★ ${(Number(movie.rating) || 0).toFixed(1)}</div>
                        <button class="view-btn">View Details</button>
                    </div>
                </div>
            </div>

            <h3 class="movie-title">${movie.title}</h3>

            <p class="movie-meta"><span>${movie.year} · ★ ${(Number(movie.rating) || 0).toFixed(1)} · ${movie.reviews} reviews</span><span class="card-symbols"><button type="button" class="like-btn" data-like-id="${movie.id}" aria-label="Like ${movie.title}">♡</button><button type="button" class="watchlist-symbol" data-watchlist-id="${movie.id}" aria-label="Add ${movie.title} to watchlist">□</button><button type="button" class="watched-symbol" data-watched-id="${movie.id}" aria-label="Mark ${movie.title} as watched">○</button></span></p>
        `;

        addLikeControl(movieCard, movie);
        addWatchlistControl(movieCard, movie);
        addWatchedControl(movieCard, movie);
        movieCard.addEventListener("click", function() {
            showMovieModal(movie);
        });

        trendingMovies.appendChild(movieCard);
    });
}

async function populateTrendingMovies() {
    const trendingMovies = document.getElementById("trendingMovies");
    if (!trendingMovies) return;

    trendingMovies.innerHTML = '<div class="movie-card" style="display:flex;align-items:center;justify-content:center;min-height:220px;"><p>Loading trending titles...</p></div>';

    const trendingList = await fetchTrendingTVMazeShows();
    renderTrendingMovieCards(trendingList);

    if (trendingMovies.dataset.autoRotate === "true") return;
    trendingMovies.dataset.autoRotate = "true";

    let currentIndex = 0;
    const rotateTrendingMovies = () => {
        const activeList = trendingList.slice(currentIndex, currentIndex + 4);
        if (activeList.length < 4) {
            const wrap = trendingList.slice(0, 4 - activeList.length);
            renderTrendingMovieCards([...activeList, ...wrap]);
            currentIndex = 0;
            return;
        }

        renderTrendingMovieCards(activeList);
        currentIndex = (currentIndex + 4) % trendingList.length;
    };

    setInterval(rotateTrendingMovies, 86400000);
}

function getCurrentDayNumber() {
    return Math.floor(Date.now() / 86400000);
}

function renderPopularSeries(seriesList) {
    const container = document.getElementById("popularSeries");
    if (!container || !seriesList.length) return;

    container.innerHTML = "";
    seriesList.forEach(series => {
        const card = document.createElement("div");
        card.className = "feature-card";
        card.innerHTML = `
            <div class="large-poster">
                <img src="${series.poster}" alt="${series.title} series poster">
            </div>
            <h3>${series.title}</h3>
            <p>${series.genre} · ${series.year || "New"}</p>
            <p class="movie-meta"><span>★ ${(Number(series.rating) || 0).toFixed(1)}</span><span class="card-symbols"><button type="button" class="like-btn" data-like-id="${series.id}" aria-label="Like ${series.title}">♡</button><button type="button" class="watchlist-symbol" data-watchlist-id="${series.id}" aria-label="Add ${series.title} to watchlist">□</button><button type="button" class="watched-symbol" data-watched-id="${series.id}" aria-label="Mark ${series.title} as watched">○</button></span></p>
        `;
        addLikeControl(card, series);
        addWatchlistControl(card, series);
        addWatchedControl(card, series);
        card.addEventListener("click", () => showMovieModal(series));
        container.appendChild(card);
    });
}

async function populatePopularSeries() {
    const container = document.getElementById("popularSeries");
    if (!container) return;

    const popularList = await fetchTrendingTVMazeShows();
    const startIndex = getCurrentDayNumber() % popularList.length;
    renderPopularSeries([
        popularList[startIndex],
        popularList[(startIndex + 1) % popularList.length]
    ]);

    setInterval(async () => {
        const updatedList = await fetchTrendingTVMazeShows();
        const updatedStart = getCurrentDayNumber() % updatedList.length;
        renderPopularSeries([
            updatedList[updatedStart],
            updatedList[(updatedStart + 1) % updatedList.length]
        ]);
    }, 86400000);
}


// ===========================
// POPULATE FILMS GRID (FILMS PAGE)
// ===========================

function renderMoviesToGrid(movieList, filmsGrid) {
    filmsGrid.innerHTML = "";

    movieList.forEach(movie => {
        const movieCard = document.createElement("div");
        movieCard.classList.add("movie-card");
        movieCard.innerHTML = `
            <div class="poster">
                <img
                    src="${movie.poster}"
                    alt="${movie.title}"
                >
                <div class="movie-overlay">
                    <div class="movie-info">
                        <p class="movie-genre">${movie.genre}</p>
                        <p class="movie-year">${movie.year}</p>
                        <div class="movie-rating">★ ${(Number(movie.rating) || 0).toFixed(1)}</div>
                        <button class="view-btn">View Details</button>
                    </div>
                </div>
            </div>

            <h3 class="movie-title">${movie.title}</h3>

            <p class="movie-meta"><span>${movie.year} · ★ ${(Number(movie.rating) || 0).toFixed(1)}</span><span class="card-symbols"><button type="button" class="like-btn" data-like-id="${movie.id}" aria-label="Like ${movie.title}">♡</button><button type="button" class="watchlist-symbol" data-watchlist-id="${movie.id}" aria-label="Add ${movie.title} to watchlist">□</button><button type="button" class="watched-symbol" data-watched-id="${movie.id}" aria-label="Mark ${movie.title} as watched">○</button></span></p>
        `;

        addLikeControl(movieCard, movie);
        addWatchlistControl(movieCard, movie);
        addWatchedControl(movieCard, movie);
        movieCard.addEventListener("click", function() {
            showMovieModal(movie);
        });

        filmsGrid.appendChild(movieCard);
    });
}

function populateFilmsGrid() {
    const filmsGrid = document.getElementById("filmsGrid");
    if (!filmsGrid) return;

    const sourceMovies = getActiveMovies();
    renderMoviesToGrid(sourceMovies.slice(0, 12), filmsGrid);
}


// ===========================
// MOVIE DETAILS MODAL
// ===========================

function addToWatchlistModal(movieId) {
    if (!userManager.currentUser) {
        alert("Please log in to add to watchlist");
        window.location.href = "login.html";
        return;
    }
    
    if (userManager.currentUser.watchlist?.some(id => String(id) === String(movieId))) {
        alert("Already in your watchlist");
        return;
    }

    showConfirmDialog("Add this series to your watchlist?", () => {
        userManager.addToWatchlist(movieId, window.activeMovie);
        showMessageDialog("✓ Added to watchlist!");
    });
}

function handleCreateWatchlist() {
    if (!userManager.currentUser) {
        window.location.href = "login.html";
        return;
    }

    window.location.href = "watchlist.html";
}

function markAsWatchedModal(movieId) {
    if (!userManager.currentUser) {
        alert("Please log in to mark as watched");
        window.location.href = "login.html";
        return;
    }
    
    if (userManager.currentUser.watched?.some(id => String(id) === String(movieId))) {
        alert("Already in your watched list");
        return;
    }

    showConfirmDialog("Mark this series as watched?", () => {
        userManager.addToWatched(movieId, window.activeMovie);
        showMessageDialog("✓ Marked as watched!");
    });
}

function toggleSeriesLike(movie) {
    if (!userManager.currentUser) {
        window.location.href = "login.html";
        return;
    }

    userManager.currentUser.likes = userManager.currentUser.likes || [];
    userManager.currentUser.movieRecords = userManager.currentUser.movieRecords || {};
    userManager.currentUser.movieRecords[movie.id] = movie;
    const index = userManager.currentUser.likes.findIndex(id => String(id) === String(movie.id));

    if (index === -1) {
        userManager.currentUser.likes.push(movie.id);
    } else {
        userManager.currentUser.likes.splice(index, 1);
    }

    userManager.updateProfile({
        likes: userManager.currentUser.likes,
        movieRecords: userManager.currentUser.movieRecords
    });

    const likeButton = document.querySelector(`[data-like-id="${movie.id}"]`);
    if (likeButton) {
        likeButton.classList.toggle("liked", index === -1);
        likeButton.textContent = index === -1 ? "♥" : "♡";
    }
}

function addLikeControl(card, movie) {
    const likeButton = card.querySelector("[data-like-id]");
    if (!likeButton) return;

    const liked = userManager.currentUser?.likes?.some(id => String(id) === String(movie.id));
    likeButton.classList.toggle("liked", Boolean(liked));
    likeButton.textContent = liked ? "♥" : "♡";
    likeButton.addEventListener("click", event => {
        event.stopPropagation();
        toggleSeriesLike(movie);
    });
}

function toggleSeriesWatchlist(movie) {
    if (!userManager.currentUser) {
        window.location.href = "login.html";
        return;
    }

    userManager.currentUser.watchlist = userManager.currentUser.watchlist || [];
    const saved = userManager.currentUser.watchlist.some(id => String(id) === String(movie.id));
    if (saved) {
        userManager.removeFromWatchlist(movie.id);
    } else {
        userManager.addToWatchlist(movie.id, movie);
    }

    const watchlistButton = document.querySelector(`[data-watchlist-id="${movie.id}"]`);
    if (watchlistButton) {
        watchlistButton.classList.toggle("watchlisted", !saved);
        watchlistButton.textContent = !saved ? "▣" : "□";
    }
}

function addWatchlistControl(card, movie) {
    const watchlistButton = card.querySelector("[data-watchlist-id]");
    if (!watchlistButton) return;

    const saved = userManager.currentUser?.watchlist?.some(id => String(id) === String(movie.id));
    watchlistButton.classList.toggle("watchlisted", Boolean(saved));
    watchlistButton.textContent = saved ? "▣" : "□";
    watchlistButton.addEventListener("click", event => {
        event.stopPropagation();
        toggleSeriesWatchlist(movie);
    });
}

function toggleSeriesWatched(movie) {
    if (!userManager.currentUser) {
        window.location.href = "login.html";
        return;
    }

    userManager.currentUser.watched = userManager.currentUser.watched || [];
    const saved = userManager.currentUser.watched.some(id => String(id) === String(movie.id));
    if (saved) {
        removeFromWatched(movie.id);
    } else {
        userManager.addToWatched(movie.id, movie);
    }

    const watchedButton = document.querySelector(`[data-watched-id="${movie.id}"]`);
    if (watchedButton) {
        watchedButton.classList.toggle("watched", !saved);
        watchedButton.textContent = !saved ? "✓" : "○";
    }
}

function addWatchedControl(card, movie) {
    const watchedButton = card.querySelector("[data-watched-id]");
    if (!watchedButton) return;

    const saved = userManager.currentUser?.watched?.some(id => String(id) === String(movie.id));
    watchedButton.classList.toggle("watched", Boolean(saved));
    watchedButton.textContent = saved ? "✓" : "○";
    watchedButton.addEventListener("click", event => {
        event.stopPropagation();
        toggleSeriesWatched(movie);
    });
}

function saveMovieRating(movieId, rating) {
    if (!userManager.currentUser) {
        alert("Please log in to rate");
        window.location.href = "login.html";
        return;
    }

    const ratingValue = Number(rating);
    if (ratingValue >= 1 && ratingValue <= 5) {
        userManager.rateMovie(movieId, ratingValue);
        const ratingMessage = document.getElementById("userRatingMessage");
        if (ratingMessage) ratingMessage.textContent = `Your rating: ${ratingValue}/5`;
        document.querySelectorAll(".user-rating-star").forEach(star => {
            star.classList.toggle("selected", Number(star.dataset.rating) <= ratingValue);
        });
    }
}

async function fetchTVMazeSeriesDetails(movie) {
    const tvMazeId = movie.tvmazeId || (Number.isInteger(Number(movie.id)) ? movie.id : null);
    if (!tvMazeId) return movie;

    try {
        const response = await fetch(`https://api.tvmaze.com/shows/${tvMazeId}?embed=cast`);
        if (!response.ok) return movie;

        const show = await response.json();
        return {
            ...movie,
            tvmazeId,
            title: show.name || movie.title,
            year: Number(show.premiered?.slice(0, 4)) || movie.year,
            releaseDate: show.premiered || movie.releaseDate || "Not available",
            genre: show.genres?.join(", ") || movie.genre,
            rating: Number(show.rating?.average ?? movie.rating) || 0,
            plot: stripHtml(show.summary || movie.plot),
            director: show.network?.name || movie.director,
            cast: (show._embedded?.cast || []).slice(0, 8).map(item => item.person?.name).filter(Boolean)
        };
    } catch (error) {
        return movie;
    }
}

function saveSeriesReview(movieId, text) {
    if (!userManager.currentUser) {
        window.location.href = "login.html";
        return;
    }

    const reviewText = String(text || "").trim();
    if (!reviewText) return;

    const allReviews = JSON.parse(localStorage.getItem("seriesReviews") || "{}");
    allReviews[movieId] = allReviews[movieId] || [];
    const userReview = {
        userId: userManager.currentUser.id,
        username: userManager.currentUser.username,
        avatarImage: userManager.currentUser.avatarImage || "",
        avatar: userManager.currentUser.avatar || userManager.currentUser.username.charAt(0).toUpperCase(),
        title: window.activeMovie?.title || "a series",
        text: reviewText,
        date: new Date().toLocaleDateString(),
        createdAt: Date.now()
    };
    const existingIndex = allReviews[movieId].findIndex(review => review.userId === userReview.userId);
    if (existingIndex >= 0) {
        allReviews[movieId][existingIndex] = userReview;
    } else {
        allReviews[movieId].unshift(userReview);
    }
    localStorage.setItem("seriesReviews", JSON.stringify(allReviews));
    renderSeriesReviews(movieId);
}

function renderSeriesReviews(movieId) {
    const container = document.getElementById("seriesReviews");
    if (!container) return;

    const allReviews = JSON.parse(localStorage.getItem("seriesReviews") || "{}");
    const reviews = allReviews[movieId] || [];
    container.innerHTML = reviews.length
        ? reviews.map(review => `<article class="series-review"><strong>${escapeHTML(review.username || "Series member")}</strong><small>${escapeHTML(review.date || "")}</small><p>${escapeHTML(review.text)}</p></article>`).join("")
        : "<p class=\"review-empty\">No reviews yet. Be the first to review this series.</p>";
}

function renderPublicReviews() {
    const container = document.getElementById("publicReviews");
    if (!container) return;

    const allReviews = JSON.parse(localStorage.getItem("seriesReviews") || "{}");
    const reviews = Object.values(allReviews).flat();
    if (!reviews.length) {
        container.innerHTML = '<p class="review-empty">No community reviews yet. Open a series and share your review.</p>';
        return;
    }

    container.innerHTML = reviews.map(review => `
        <article class="review-card-full">
            <div class="review-header">
                <div class="review-user-info">
                    <div class="avatar">${escapeHTML(String(review.username || "S").charAt(0).toUpperCase())}</div>
                    <div>
                        <strong>${escapeHTML(review.username || "Series member")}</strong>
                        <p>reviewed ${escapeHTML(review.title || "a series")}</p>
                    </div>
                </div>
                <p class="review-date">${escapeHTML(review.date || "")}</p>
            </div>
            <div class="review-content">
                <h3>${escapeHTML(review.title || "Series review")}</h3>
                <p>${escapeHTML(review.text)}</p>
            </div>
        </article>
    `).join("");
}

function renderLatestReviews() {
    const container = document.getElementById("latestReviews");
    if (!container) return;

    const allReviews = JSON.parse(localStorage.getItem("seriesReviews") || "{}");
    const reviews = Object.values(allReviews)
        .flat()
        .sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0))
        .slice(0, 2);
    if (!reviews.length) {
        container.innerHTML = '<p class="review-empty">No recent reviews yet. Open a series and share your review.</p>';
        return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "{}");
    container.innerHTML = reviews.map(review => {
        const reviewer = Object.values(users).find(user => String(user.id) === String(review.userId));
        const profileImage = review.avatarImage || reviewer?.avatarImage || "";
        const avatar = review.avatar || reviewer?.avatar || String(review.username || "S").charAt(0).toUpperCase();
        return `
        <article class="review-card">
            <div class="review-user">
                <div class="avatar">${profileImage ? `<img src="${profileImage}" alt="${escapeHTML(review.username || "Series member")} profile picture">` : escapeHTML(avatar)}</div>
                <div>
                    <strong>${escapeHTML(review.username || "Series member")}</strong>
                    <small>reviewed ${escapeHTML(review.title || "a series")}</small>
                </div>
            </div>
            <h3>${escapeHTML(review.title || "Series review")}</h3>
            <p class="stars">★★★★★</p>
            <p>${escapeHTML(review.text)}</p>
            <span class="review-date">${escapeHTML(review.date || "")}</span>
        </article>
    `;
    }).join("");
}


async function showMovieModal(movie) {
    movie = await fetchTVMazeSeriesDetails(movie);
    window.activeMovie = movie;
    let modal = document.getElementById("movieModal");
    
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "movieModal";
        modal.className = "movie-modal";
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            
            <div class="modal-body">
                <div class="modal-poster">
                    <img src="${movie.poster}" alt="${movie.title}">
                </div>
                
                <div class="modal-details">
                    <h1>${movie.title}</h1>
                    <p class="modal-original-title">${movie.originalTitle || movie.title}</p>
                    
                    <div class="modal-meta">
                        <span class="badge">${movie.genre}</span>
                        <span class="badge">${movie.year}</span>
                        <span class="badge">${movie.duration}</span>
                    </div>
                    
                    <div class="modal-rating">
                        <div class="stars">★ ${movie.rating.toFixed(1)}</div>
                        <p class="review-count">${movie.reviews} reviews</p>
                    </div>

                    <div class="user-rating-picker">
                        <strong>Your rating</strong>
                        <div class="user-rating-stars" role="radiogroup" aria-label="Rate ${movie.title}">
                            ${[1, 2, 3, 4, 5].map(rating => `<button type="button" class="user-rating-star" data-rating="${rating}" aria-label="Rate ${rating} out of 5">★</button>`).join("")}
                        </div>
                        <p id="userRatingMessage">${userManager.currentUser?.ratings?.[movie.id] ? `Your rating: ${userManager.currentUser.ratings[movie.id]}/5` : "Select a rating"}</p>
                    </div>
                    
                    <div class="modal-director">
                        <strong>Director:</strong> ${movie.director}
                    </div>

                    <div class="series-information">
                        <p><strong>Release date:</strong> ${movie.releaseDate || `${movie.year || "Not available"}`}</p>
                        <p><strong>Network:</strong> ${movie.director || "TVMaze"}</p>
                    </div>
                    
                    <div class="modal-plot">
                        <h3>Synopsis</h3>
                        <p>${movie.plot || "No synopsis available."}</p>
                    </div>

                    <div class="modal-cast">
                        <h3>Cast</h3>
                        <div class="modal-cast-list">${(movie.cast || []).map(actor => `<span>${actor}</span>`).join("") || "<span>Cast not available</span>"}</div>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="action-btn watchlist-btn" onclick="addToWatchlistModal(${movie.id})">+ Add to Watchlist</button>
                        <button class="action-btn rate-btn" onclick="markAsWatchedModal(${movie.id})">✓ Mark as Watched</button>
                        <button type="button" class="action-btn modal-like-btn" data-modal-like="${movie.id}">♡ Like</button>
                        <button type="button" class="action-btn" data-modal-list="${movie.id}">+ Add to List</button>
                        <button type="button" class="action-btn" data-modal-share>Share</button>
                    </div>

                    <div class="modal-community-summary"><strong>${movie.reviews || 0}</strong> community ratings <span>·</span> <strong>${userManager.currentUser?.likes?.includes(movie.id) ? "Liked" : "Like this series"}</strong></div>

                    <div class="series-reviews">
                        <h3>Reviews</h3>
                        <form id="seriesReviewForm" class="series-review-form">
                            <textarea id="seriesReviewText" rows="4" placeholder="Write your review about this series..." required></textarea>
                            <button type="submit" class="action-btn">Post review</button>
                        </form>
                        <div id="seriesReviews"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = "block";

    const modalLikeButton = modal.querySelector("[data-modal-like]");
    const isLiked = userManager.currentUser?.likes?.some(id => String(id) === String(movie.id));
    modalLikeButton.textContent = isLiked ? "♥ Liked" : "♡ Like";
    modalLikeButton.classList.toggle("liked", Boolean(isLiked));
    modalLikeButton.addEventListener("click", () => {
        toggleSeriesLike(movie);
        const liked = userManager.currentUser?.likes?.some(id => String(id) === String(movie.id));
        modalLikeButton.textContent = liked ? "♥ Liked" : "♡ Like";
        modalLikeButton.classList.toggle("liked", liked);
    });

    modal.querySelector("[data-modal-share]").addEventListener("click", async () => {
        const shareText = `${movie.title} (${movie.year || ""})`;
        if (navigator.share) {
            await navigator.share({ title: movie.title, text: shareText }).catch(() => {});
        } else {
            await navigator.clipboard?.writeText(shareText);
            showMessageDialog("Series title copied to your clipboard.");
        }
    });

    modal.querySelector("[data-modal-list]").addEventListener("click", () => {
        if (!userManager.currentUser) {
            window.location.href = "login.html";
            return;
        }
        if (!userManager.currentUser.lists?.length) {
            showMessageDialog("Create a personal list first from My Lists.");
            return;
        }
        const list = userManager.currentUser.lists[0];
        if (userManager.addMovieToList(list.id, movie.id)) {
            userManager.currentUser.movieRecords = userManager.currentUser.movieRecords || {};
            userManager.currentUser.movieRecords[movie.id] = movie;
            userManager.updateProfile({ movieRecords: userManager.currentUser.movieRecords });
            showMessageDialog(`Added to ${list.name}.`);
        } else {
            showMessageDialog(`Already in ${list.name}.`);
        }
    });

    renderSeriesReviews(movie.id);
    modal.querySelector("#seriesReviewForm").addEventListener("submit", event => {
        event.preventDefault();
        saveSeriesReview(movie.id, modal.querySelector("#seriesReviewText").value);
        modal.querySelector("#seriesReviewText").value = "";
    });

    const savedRating = Number(userManager.currentUser?.ratings?.[movie.id] || 0);
    modal.querySelectorAll(".user-rating-star").forEach(star => {
        star.classList.toggle("selected", Number(star.dataset.rating) <= savedRating);
        star.addEventListener("click", () => saveMovieRating(movie.id, star.dataset.rating));
    });
    
    // Close modal handlers
    const closeBtn = modal.querySelector(".close-modal");
    closeBtn.addEventListener("click", function() {
        modal.style.display = "none";
    });
    
    window.addEventListener("click", function(e) {
        if (e.target == modal) {
            modal.style.display = "none";
        }
    });
}


// ===========================
// FORM HANDLERS
// ===========================

// Login Form Handler
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        
        const result = userManager.login(email, password);
        
        if (result.success) {
            alert("✓ " + result.message);
            window.location.href = "profile.html";
        } else {
            alert("✗ " + result.message);
        }
    });
}

// Signup Form Handler
const signupForm = document.getElementById("signupForm");
if (signupForm) {
    signupForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirm-password").value;
        
        if (password !== confirmPassword) {
            alert("✗ Passwords don't match!");
            return;
        }
        
        const result = userManager.createUser(username, email, password);
        
        if (result.success) {
            alert("✓ " + result.message);
            userManager.login(email, password);
            window.location.href = "profile.html";
        } else {
            alert("✗ " + result.message);
        }
    });
}

// Contact Form Handler
const contactForm = document.getElementById("contactForm");
if (contactForm) {
    contactForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const subject = document.getElementById("subject").value;
        const message = document.getElementById("message").value;
        
        if (name && email && subject && message) {
            alert("✓ Message sent successfully! We'll get back to you soon.");
            contactForm.reset();
        }
    });
}


// ===========================
// FILTER & SEARCH FUNCTIONALITY
// ===========================

function setupFilters() {
    const genreFilter = document.getElementById("genre");
    const yearFilter = document.getElementById("year");
    const ratingFilter = document.getElementById("rating");
    const sortFilter = document.getElementById("sort");
    
    if (genreFilter) genreFilter.addEventListener("change", applyFilters);
    if (yearFilter) yearFilter.addEventListener("change", applyFilters);
    if (ratingFilter) ratingFilter.addEventListener("change", applyFilters);
    if (sortFilter) sortFilter.addEventListener("change", applyFilters);
}

function applyFilters() {
    const genreValue = document.getElementById("genre")?.value || "";
    const yearValue = document.getElementById("year")?.value || "";
    const ratingValue = parseFloat(document.getElementById("rating")?.value) || 0;
    const sortValue = document.getElementById("sort")?.value || "popular";

    const sourceMovies = getActiveMovies();
    let filteredMovies = [...sourceMovies];

    const normalizedGenre = normalizeGenreKey(genreValue);
    if (normalizedGenre) {
        filteredMovies = filteredMovies.filter(m => normalizeGenreKey(m.genre).includes(normalizedGenre) || normalizeGenreKey(m.genre) === normalizedGenre);
    }

    if (yearValue) {
        filteredMovies = filteredMovies.filter(m => String(m.year) === String(yearValue));
    }

    if (ratingValue > 0) {
        filteredMovies = filteredMovies.filter(m => (Number(m.rating) || 0) >= ratingValue);
    }

    if (sortValue === "rating") {
        filteredMovies.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    } else if (sortValue === "recent") {
        filteredMovies.sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0));
    } else if (sortValue === "alphabetical") {
        filteredMovies.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else {
        filteredMovies.sort((a, b) => (Number(b.reviews) || 0) - (Number(a.reviews) || 0));
    }

    const filmsGrid = document.getElementById("filmsGrid");
    if (filmsGrid) {
        renderMoviesToGrid(filteredMovies.slice(0, 24), filmsGrid);
    }
}


// ===========================
// SEARCH FUNCTIONALITY
// ===========================

const API_CONFIG = {
    enabled: true,
    tvMazeBaseUrl: "https://api.tvmaze.com/search/shows",
    omdbEnabled: Boolean(window.OMDB_API_KEY && window.OMDB_API_KEY.trim()),
    apiKey: (window.OMDB_API_KEY || "").trim(),
    baseUrl: window.OMDB_BASE_URL || "https://www.omdbapi.com/"
};

function stripHtml(value) {
    return String(value || "")
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function escapeHTML(value) {
    return String(value || "").replace(/[&<>'"]/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        "\"": "&quot;"
    }[character]));
}

function buildSearchResultFromShow(show) {
    const title = show?.name || show?.title || "Unknown title";
    const year = Number(show?.premiered?.slice(0, 4) || show?.year || 0);
    const rating = Number(show?.rating?.average ?? show?.vote_average ?? 0);
    const genres = Array.isArray(show?.genres) ? show.genres.filter(Boolean) : normalizeGenres(show?.genre || show?.genres || []);
    const genreText = genres.length ? genres.join(", ") : "Movie";
    const poster = show?.image?.original || show?.image?.medium || show?.poster || "assets/images/Inception.jfif";
    const plot = stripHtml(show?.summary || show?.overview || "No plot description available yet.");

    return {
        id: show?.id ?? `${title}-${year}`,
        tvmazeId: show?.id,
        title,
        year,
        rating: Number.isFinite(rating) ? rating : 0,
        genre: genreText,
        genreList: genres,
        director: show?.network?.name || "TVMaze",
        duration: show?.runtime ? `${show.runtime} min` : (show?.duration || "N/A"),
        plot,
        poster,
        reviews: show?.reviews || Math.max(100, Math.round((rating || 4) * 220))
    };
}

function replaceLegacySearchButtons() {
    document.querySelectorAll(".search-btn").forEach(button => {
        const navActions = button.closest(".nav-actions");
        if (!navActions) return;

        const hasInput = navActions.querySelector(".search-input");
        if (hasInput) {
            button.remove();
            return;
        }

        const searchBar = document.createElement("div");
        searchBar.className = "search-bar";
        searchBar.innerHTML = `
            <input type="text" class="search-input" placeholder="Search movies, actors, directors..." aria-label="Search movies">
            <button type="button" class="search-submit">🔍 Search</button>
        `;

        button.replaceWith(searchBar);
    });
}

function normalizeText(value) {
    return String(value || "").toLowerCase().trim();
}

function normalizeGenres(value) {
    if (!value) return [];
    if (Array.isArray(value)) {
        return value
            .map(item => String(item).trim())
            .filter(Boolean);
    }

    return String(value)
        .split(/[|,/]+/)
        .map(item => item.trim())
        .filter(Boolean);
}

function normalizeMovieData(movie) {
    const title = movie.title || movie.name || "Unknown title";
    const year = Number(movie.year || movie.release_date?.slice(0, 4) || movie.first_air_date?.slice(0, 4) || 0);
    const rating = Number(movie.rating ?? movie.vote_average ?? 0);
    const genreList = normalizeGenres(movie.genre || movie.genres || movie.genre_ids || []);
    const genreText = genreList.length ? genreList.join(", ") : "Drama";
    const poster = movie.poster || "assets/images/Inception.jfif";
    const plot = movie.plot || movie.overview || "No plot description available yet.";

    return {
        id: movie.id ?? `${title}-${year}`,
        title,
        year,
        rating: Number.isFinite(rating) ? rating : 0,
        genre: genreText,
        genreList: genreList,
        director: movie.director || "N/A",
        duration: movie.duration || "N/A",
        plot,
        poster,
        reviews: movie.reviews || Math.max(100, Math.round((rating || 4) * 220))
    };
}

function searchMovies(query) {
    const term = normalizeText(query);
    if (!term) return [];

    return movies
        .filter(movie => {
            const genreList = normalizeGenres(movie.genre);
            const haystack = [
                movie.title,
                movie.director,
                movie.plot,
                movie.genre,
                ...genreList,
                String(movie.year)
            ].join(" ").toLowerCase();

            return haystack.includes(term);
        })
        .slice(0, 12)
        .map(normalizeMovieData);
}

async function fetchTVMazeSearch(query) {
    const trimmed = normalizeText(query);
    if (!trimmed) return [];

    try {
        const response = await fetch(`${API_CONFIG.tvMazeBaseUrl}?q=${encodeURIComponent(trimmed)}`);
        if (!response.ok) {
            return searchMovies(trimmed);
        }

        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) {
            return searchMovies(trimmed);
        }

        return data
            .map(item => item && item.show ? buildSearchResultFromShow(item.show) : null)
            .filter(Boolean)
            .slice(0, 10);
    } catch (error) {
        return searchMovies(trimmed);
    }
}

async function fetchMovieApiSearch(query) {
    const cleaned = normalizeText(query);
    if (!cleaned) return [];

    try {
        const tvMazeResults = await fetchTVMazeSearch(cleaned);
        if (tvMazeResults.length > 0) {
            return tvMazeResults;
        }
    } catch (error) {
        // Fall back to the local catalog if the free API is unavailable.
    }

    return searchMovies(cleaned);
}

async function fetchLiveSuggestions(query) {
    const trimmed = String(query || "").trim();
    if (!trimmed) return [];

    try {
        const suggestions = await fetchTVMazeSearch(trimmed);
        if (suggestions.length > 0) return suggestions.slice(0, 6);
    } catch (error) {
        // Keep using the local results as a fallback.
    }

    return searchMovies(trimmed).slice(0, 6);
}

async function performSearch(query) {
    const cleaned = String(query || "").trim();
    if (!cleaned) {
        alert("Please enter a movie name or keyword");
        return;
    }

    const results = await fetchMovieApiSearch(cleaned);
    sessionStorage.setItem("searchQuery", cleaned);
    sessionStorage.setItem("searchResults", JSON.stringify(results));
    window.location.href = "search.html";
}

function renderSuggestions(list, box, input) {
    if (!box || !input) return;

    if (!list || list.length === 0) {
        box.innerHTML = "";
        box.classList.remove("visible");
        return;
    }

    box.innerHTML = list
        .slice(0, 6)
        .map(movie => `
            <button type="button" class="search-suggestion-item" data-title="${movie.title}">
                <span class="suggestion-poster">
                    <img src="${movie.poster}" alt="${movie.title}">
                </span>
                <span class="suggestion-info">
                    <strong>${movie.title}</strong>
                    <small>${movie.year || ""} • ${movie.genre || "Movie"}</small>
                </span>
            </button>
        `)
        .join("");

    box.classList.add("visible");

    box.querySelectorAll(".search-suggestion-item").forEach(button => {
        button.addEventListener("click", () => {
            const selected = button.getAttribute("data-title");
            input.value = selected;
            box.classList.remove("visible");
            performSearch(selected);
        });
    });
}

function setupSearchFunctionality() {
    const fieldGroups = [
        ...document.querySelectorAll(".search-input"),
        ...document.querySelectorAll(".search-input-small"),
        ...document.querySelectorAll(".hero-search input")
    ];

    fieldGroups.forEach(searchInput => {
        if (searchInput.dataset.bound === "true") return;
        searchInput.dataset.bound = "true";

        const parent = searchInput.closest(".search-bar, .hero-search, .watched-search-form") || searchInput.parentElement;
        if (!parent) return;

        let suggestionBox = parent.querySelector(".search-suggestions");
        if (!suggestionBox) {
            suggestionBox = document.createElement("div");
            suggestionBox.className = "search-suggestions";
            parent.appendChild(suggestionBox);
        }

        const searchButton = parent.querySelector(".search-submit") || parent.querySelector(".hero-search button");

        searchInput.addEventListener("input", async () => {
            const query = searchInput.value.trim();
            if (!query) {
                suggestionBox.innerHTML = "";
                suggestionBox.classList.remove("visible");
                return;
            }

            const suggestions = await fetchLiveSuggestions(query);
            renderSuggestions(suggestions, suggestionBox, searchInput);
        });

        searchInput.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                event.preventDefault();
                performSearch(searchInput.value);
            }
        });

        if (searchButton) {
            searchButton.addEventListener("click", () => {
                const queryValue = searchInput.value.trim();
                if (!queryValue) {
                    alert("Please enter a movie name or keyword");
                    searchInput.focus();
                    return;
                }
                performSearch(queryValue);
            });
        }

        document.addEventListener("click", event => {
            if (!parent.contains(event.target)) {
                suggestionBox.classList.remove("visible");
            }
        });
    });
}

// Display search results
function displaySearchResults() {
    const resultsContainer = document.getElementById("searchResults");
    const queryDisplay = document.getElementById("searchQuery");
    
    if (!resultsContainer) return;
    
    const results = JSON.parse(sessionStorage.getItem("searchResults")) || [];
    const query = sessionStorage.getItem("searchQuery") || "";
    
    if (queryDisplay) {
        queryDisplay.textContent = `"${query}"`;
    }
    
    resultsContainer.innerHTML = "";
    
    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <p>No movies found for your search.</p>
                <p>Try searching with different keywords.</p>
            </div>
        `;
        return;
    }
    
    results.forEach(movie => {
        const movieCard = document.createElement("div");
        movieCard.classList.add("movie-card");
        movieCard.innerHTML = `
            <div class="poster">
                <img src="${movie.poster}" alt="${movie.title}">
                <div class="movie-overlay">
                    <div class="movie-info">
                        <p class="movie-genre">${movie.genre}</p>
                        <p class="movie-year">${movie.year}</p>
                        <div class="movie-rating">★ ${movie.rating.toFixed(1)}</div>
                        <button class="view-btn">View Details</button>
                    </div>
                </div>
            </div>
            <h3 class="movie-title">${movie.title}</h3>
            <p class="movie-meta"><span>${movie.year} · ★ ${movie.rating.toFixed(1)} · ${movie.reviews} reviews</span><span class="card-symbols"><button type="button" class="like-btn" data-like-id="${movie.id}" aria-label="Like ${movie.title}">♡</button><button type="button" class="watchlist-symbol" data-watchlist-id="${movie.id}" aria-label="Add ${movie.title} to watchlist">□</button><button type="button" class="watched-symbol" data-watched-id="${movie.id}" aria-label="Mark ${movie.title} as watched">○</button></span></p>
        `;
        
        addLikeControl(movieCard, movie);
        addWatchlistControl(movieCard, movie);
        addWatchedControl(movieCard, movie);
        movieCard.addEventListener("click", function() {
            showMovieModal(movie);
        });
        
        resultsContainer.appendChild(movieCard);
    });
}

function initializeMovieCards() {
    const movieCards = document.querySelectorAll(".movie-card");
    movieCards.forEach(card => {
        card.addEventListener("mouseenter", function() {
            this.style.transform = "translateY(-8px)";
        });
        
        card.addEventListener("mouseleave", function() {
            this.style.transform = "translateY(0)";
        });
    });
}

// ===========================
// POPULATE WATCHLIST PAGE
// ===========================

function populateWatchlist(sortBy = "added") {
    const watchlistContainer = document.getElementById("watchlistContainer");
    
    if (!watchlistContainer || !userManager.currentUser) {
        return;
    }
    
    watchlistContainer.innerHTML = "";
    
    if (userManager.currentUser.watchlist.length === 0) {
        watchlistContainer.innerHTML = `
            <div class="empty-state">
                <p>Your watchlist is empty</p>
                <p><a href="films.html">Start adding movies →</a></p>
            </div>
        `;
        return;
    }
    
    let savedMovies = userManager.currentUser.watchlist.map(movieId => ({
        movieId,
        movie: userManager.currentUser.movieRecords?.[movieId] || movies.find(m => String(m.id) === String(movieId))
    })).filter(item => item.movie);

    if (sortBy === "title") {
        savedMovies.sort((a, b) => a.movie.title.localeCompare(b.movie.title));
    } else if (sortBy === "rating") {
        savedMovies.sort((a, b) => (Number(b.movie.rating) || 0) - (Number(a.movie.rating) || 0));
    } else if (sortBy === "year") {
        savedMovies.sort((a, b) => (Number(b.movie.year) || 0) - (Number(a.movie.year) || 0));
    }

    savedMovies.forEach(({ movieId, movie }) => {
            const movieCard = document.createElement("div");
            movieCard.classList.add("movie-card");
            movieCard.innerHTML = `
                <div class="poster">
                    <img src="${movie.poster}" alt="${movie.title}">
                    <div class="movie-overlay">
                        <div class="movie-info">
                            <button type="button" class="action-btn small-btn" data-remove-watchlist="${movieId}">✓ Remove</button>
                        </div>
                    </div>
                </div>
                <h3 class="movie-title">${movie.title}</h3>
                <p class="movie-meta"><span>${movie.year} · ★ ${(Number(movie.rating) || 0).toFixed(1)}</span><span class="card-symbols"><button type="button" class="like-btn" data-like-id="${movie.id}" aria-label="Like ${movie.title}">♡</button><button type="button" class="watchlist-symbol" data-watchlist-id="${movie.id}" aria-label="Add ${movie.title} to watchlist">□</button><button type="button" class="watched-symbol" data-watched-id="${movie.id}" aria-label="Mark ${movie.title} as watched">○</button></span></p>
            `;
            addLikeControl(movieCard, movie);
            addWatchlistControl(movieCard, movie);
            addWatchedControl(movieCard, movie);
            movieCard.addEventListener("click", () => showMovieModal(movie));
            movieCard.querySelector("[data-remove-watchlist]").addEventListener("click", event => {
                event.stopPropagation();
                removeFromWatchlist(movieId);
            });
            watchlistContainer.appendChild(movieCard);
    });
}

function populateHomepageWatchlist() {
    const container = document.querySelector(".watchlist-visual");
    if (!container) return;

    const currentUser = userManager.currentUser;
    if (!currentUser) {
        container.innerHTML = '<div class="watchlist-empty-preview"><p>Sign in to see your saved series.</p></div>';
        return;
    }

    const savedMovies = (currentUser.watchlist || [])
        .map(movieId => currentUser.movieRecords?.[movieId] || movies.find(movie => String(movie.id) === String(movieId)))
        .filter(Boolean)
        .slice(0, 4);

    if (!savedMovies.length) {
        container.innerHTML = '<div class="watchlist-empty-preview"><p>Your Watchlist is empty.</p><a href="films.html">Browse series</a></div>';
        return;
    }

    container.innerHTML = savedMovies.map(movie => `
        <button type="button" class="mini-poster" data-home-watchlist-id="${movie.id}" aria-label="Open ${movie.title}">
            <img src="${movie.poster}" alt="${movie.title} poster">
            <span>${movie.title}</span>
        </button>
    `).join("");

    container.querySelectorAll("[data-home-watchlist-id]").forEach((card, index) => {
        card.addEventListener("click", () => showMovieModal(savedMovies[index]));
    });
}

function removeFromWatchlist(movieId) {
    userManager.removeFromWatchlist(movieId);
    populateWatchlist();
}

// ===========================
// POPULATE WATCHED PAGE
// ===========================

function populateWatched() {
    const watchedContainer = document.getElementById("watchedContainer");
    
    if (!watchedContainer || !userManager.currentUser) {
        return;
    }
    
    watchedContainer.innerHTML = "";
    
    if (userManager.currentUser.watched.length === 0) {
        watchedContainer.innerHTML = `
            <div class="empty-state">
                <p>You haven't marked any movies as watched</p>
                <p><a href="films.html">Start watching →</a></p>
            </div>
        `;
        return;
    }
    
    userManager.currentUser.watched.forEach(movieId => {
        const movie = userManager.currentUser.movieRecords?.[movieId] || movies.find(m => String(m.id) === String(movieId));
        if (movie) {
            const rating = userManager.currentUser.ratings[movieId];
            const movieCard = document.createElement("div");
            movieCard.classList.add("movie-card");
            movieCard.innerHTML = `
                <div class="poster">
                    <img src="${movie.poster}" alt="${movie.title}">
                </div>
                <h3 class="movie-title">${movie.title}</h3>
                <p class="movie-meta"><span>${movie.year} · ★ ${(Number(movie.rating) || 0).toFixed(1)}</span><span class="card-symbols"><button type="button" class="like-btn" data-like-id="${movie.id}" aria-label="Like ${movie.title}">♡</button><button type="button" class="watchlist-symbol" data-watchlist-id="${movie.id}" aria-label="Add ${movie.title} to watchlist">□</button><button type="button" class="watched-symbol" data-watched-id="${movie.id}" aria-label="Mark ${movie.title} as watched">○</button></span></p>
                ${rating ? `<p class="user-rating">Your rating: ★ ${rating.toFixed(1)}</p>` : ''}
                <div class="watched-card-actions">
                    <button type="button" class="action-btn small-btn" data-remove-watched="${movieId}">Remove</button>
                </div>
            `;

            addLikeControl(movieCard, movie);
            addWatchlistControl(movieCard, movie);
            addWatchedControl(movieCard, movie);
            movieCard.addEventListener("click", () => showMovieModal(movie));

            movieCard.querySelector("[data-remove-watched]").addEventListener("click", event => {
                event.stopPropagation();
                removeFromWatched(movieId);
            });
            watchedContainer.appendChild(movieCard);
        }
    });
}

function removeFromWatched(movieId) {
    if (!userManager.currentUser) return;

    userManager.currentUser.watched = (userManager.currentUser.watched || [])
        .filter(id => String(id) !== String(movieId));
    userManager.updateProfile({ watched: userManager.currentUser.watched });
    populateWatched();
}

async function populateLikes() {
    const likesContainer = document.getElementById("likedSeriesGrid");
    if (!likesContainer || !userManager.currentUser) return;

    const currentUser = userManager.currentUser;
    const catalog = await fetchTVMazeMovieCatalog();
    const likedMovies = (currentUser.likes || [])
        .map(movieId => currentUser.movieRecords?.[movieId] || catalog.find(movie => String(movie.id) === String(movieId)))
        .filter(Boolean);

    likesContainer.innerHTML = "";
    if (!likedMovies.length) {
        likesContainer.innerHTML = '<div class="empty-state"><p>You haven\'t liked any series</p><p><a href="films.html">Browse series</a></p></div>';
        return;
    }

    likedMovies.forEach(movie => {
        const movieCard = document.createElement("div");
        movieCard.classList.add("movie-card");
        movieCard.innerHTML = `
            <div class="poster">
                <img src="${movie.poster}" alt="${movie.title}">
                <div class="movie-overlay"><div class="movie-info">
                    <p class="movie-genre">${movie.genre || "Series"}</p>
                    <p class="movie-year">${movie.year || ""}</p>
                    <div class="movie-rating">★ ${(Number(movie.rating) || 0).toFixed(1)}</div>
                    <button type="button" class="view-btn">View Details</button>
                </div></div>
            </div>
            <h3 class="movie-title">${movie.title}</h3>
            <p class="movie-meta"><span>${movie.year || ""} · ★ ${(Number(movie.rating) || 0).toFixed(1)}</span><span class="card-symbols"><button type="button" class="like-btn liked" data-like-id="${movie.id}" aria-label="Unlike ${movie.title}">♥</button><button type="button" class="watchlist-symbol" data-watchlist-id="${movie.id}" aria-label="Add ${movie.title} to watchlist">□</button><button type="button" class="watched-symbol" data-watched-id="${movie.id}" aria-label="Mark ${movie.title} as watched">○</button></span></p>
        `;
        addWatchlistControl(movieCard, movie);
        addWatchedControl(movieCard, movie);
        movieCard.addEventListener("click", () => showMovieModal(movie));
        movieCard.querySelector(".like-btn").addEventListener("click", event => {
            event.stopPropagation();
            toggleSeriesLike(movie);
            movieCard.remove();
            if (!likesContainer.children.length) populateLikes();
        });
        likesContainer.appendChild(movieCard);
    });
}

// ===========================
// UPDATE NAVBAR WITH USER INFO
// ===========================

function updateNavbarUserInfo() {
    const navActions = document.querySelector(".nav-actions");
    
    if (!navActions) return;
    
    // Keep the search bar if it exists
    const searchBar = navActions.querySelector(".search-bar");
    
    if (userManager.currentUser) {
        // User is logged in - add user menu
        const userMenuHTML = `
            <div class="user-menu">
                <button class="user-btn" onclick="toggleUserMenu()">
                    <span class="user-avatar">${userManager.currentUser.avatarImage ? `<img src="${userManager.currentUser.avatarImage}" alt="${userManager.currentUser.username} profile picture">` : userManager.currentUser.username.charAt(0).toUpperCase()}</span>
                    <span class="user-name">${userManager.currentUser.username}</span>
                </button>
                <div class="user-dropdown" id="userDropdown" style="display: none;">
                    <a href="profile.html">👤 My Profile</a>
                    <a href="activity.html">◷ Activity</a>
                    <a href="watched.html">🎬 Films</a>
                    <a href="diary.html">▣ Diary</a>
                    <a href="user-reviews.html">✎ Reviews</a>
                    <a href="watchlist.html">📋 Watchlist</a>
                    <a href="my-lists.html">📚 My Lists</a>
                    <a href="likes.html">♥ Likes</a>
                    <a href="tags.html"># Tags</a>
                    <a href="network.html">◎ Network</a>
                    <hr>
                    <a href="#" onclick="userLogout()">🚪 Logout</a>
                </div>
            </div>
        `;
        
        // Clear nav-actions but keep search bar
        const existingMenu = navActions.querySelector(".user-menu");
        if (existingMenu) {
            existingMenu.remove();
        }
        
        // Re-add search bar if it was removed
        if (!navActions.querySelector(".search-bar")) {
            const searchBarHTML = `
                <div class="search-bar">
                    <input type="text" class="search-input" placeholder="Search movies, actors, directors...">
                    <button class="search-submit">🔍 Search</button>
                </div>
            `;
            navActions.insertAdjacentHTML("afterbegin", searchBarHTML);
        }
        
        // Add user menu
        navActions.insertAdjacentHTML("beforeend", userMenuHTML);
        
        // Hide login/signup buttons if they exist
        const loginBtn = navActions.querySelector(".login-btn");
        const signupBtn = navActions.querySelector(".signup-btn");
        if (loginBtn) loginBtn.style.display = "none";
        if (signupBtn) signupBtn.style.display = "none";
    } else {
        // User not logged in - show login/signup buttons
        const loginBtn = navActions.querySelector(".login-btn");
        const signupBtn = navActions.querySelector(".signup-btn");
        if (loginBtn) loginBtn.style.display = "block";
        if (signupBtn) signupBtn.style.display = "block";
        
        // Hide user menu if exists
        const userMenu = navActions.querySelector(".user-menu");
        if (userMenu) userMenu.remove();
    }
    
    // Re-setup search functionality after updating navbar
    setupSearchFunctionality();
}

function toggleUserMenu() {
    const dropdown = document.getElementById("userDropdown");
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
    }
}

function userLogout() {
    userManager.logout();
    sessionStorage.removeItem("ownerAccess");
    alert("✓ Logged out successfully!");
    window.location.href = "index.html";
}

function enforceGuestAccess() {
    if (!userManager.currentUser) {
        userManager.currentUser = userManager.getCurrentUser();
    }
    if (userManager.currentUser) return;

    const pageName = window.location.pathname.split("/").pop().toLowerCase() || "index.html";
    const guestPages = ["", "index.html", "login.html", "signup.html", "forgot-password.html", "search.html", "reviews.html", "admin.html", "admin-home.html", "admin-user.html"];
    if (!guestPages.includes(pageName)) {
        window.location.href = "login.html";
    }
}


document.addEventListener("DOMContentLoaded", async function() {
    replaceLegacySearchButtons();
    enforceGuestAccess();

    const createWatchlistButton = document.getElementById("createWatchlistBtn");
    if (createWatchlistButton) {
        createWatchlistButton.addEventListener("click", handleCreateWatchlist);
    }

    if (document.getElementById("filmsGrid")) {
        const catalog = await fetchTVMazeMovieCatalog();
        if (catalog && catalog.length) {
            renderMoviesToGrid(catalog.slice(0, 24), document.getElementById("filmsGrid"));
        } else {
            populateFilmsGrid();
        }
    }

    // Populate movies on home and films pages
    populateHeroSeries();
    populateTrendingMovies();
    populatePopularSeries();
    populateHomepageWatchlist();
    populateWatchlist();
    populateWatched();
    populateLikes();
    displaySearchResults();
    renderPublicReviews();
    renderLatestReviews();

    // Setup filters and search
    setupFilters();
    setupSearchFunctionality();

    // Update navbar with user info
    updateNavbarUserInfo();

    // Initialize all interactive elements
    initializeMovieCards();
});