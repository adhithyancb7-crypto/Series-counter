document.addEventListener("DOMContentLoaded", function () {
    if (!window.userManager) return;
    userManager.currentUser = userManager.currentUser || userManager.getCurrentUser();
    if (!userManager.currentUser) return;

    const user = userManager.currentUser;
    const page = document.body.dataset.privatePage || "activity";
    const title = document.getElementById("privateTitle");
    const subtitle = document.getElementById("privateSubtitle");
    const content = document.getElementById("privateContent");
    const username = document.getElementById("privateUsername");

    if (username) username.textContent = user.username;

    if (page === "activity") {
        renderActivityPage(user, content);
        return;
    }

    if (page === "diary") {
        renderDiaryPage(user, content);
        return;
    }

    const pages = {
        activity: ["Activity", "Your recent activity across Free Series Details.", "activity"],
        diary: ["Diary", "Your personal record of watched series.", "diary"],
        reviews: ["Reviews", "Reviews and ratings you have shared.", "reviews"],
        likes: ["Likes", "Series and reviews you have liked.", "likes"],
        tags: ["Tags", "Your saved themes and viewing tags.", "tags"],
        network: ["Network", "People and activity from your series network.", "network"]
    };

    const current = pages[page] || pages.activity;
    if (title) title.textContent = current[0];
    if (subtitle) subtitle.textContent = current[1];

    const watchedCount = (user.watched || []).length;
    const listCount = (user.lists || []).length;
    const ratingCount = Object.keys(user.ratings || {}).length;
    const items = {
        activity: watchedCount ? `<div class="private-item"><strong>${user.username}</strong> has watched ${watchedCount} series.</div>` : "No activity yet. Start watching a series to build your activity.",
        diary: watchedCount ? `<div class="private-item">Your diary currently contains <strong>${watchedCount}</strong> watched series.</div>` : "Your diary is empty. Mark a series as watched to add it here.",
        reviews: ratingCount ? `<div class="private-item">You have rated <strong>${ratingCount}</strong> series.</div>` : "You have not reviewed any series yet.",
        likes: (user.likes || []).length ? `<div class="private-item">You have liked <strong>${user.likes.length}</strong> items.</div>` : "You have not liked any series or reviews yet.",
        tags: (user.tags || []).length ? `<div class="private-item">${user.tags.map(tag => `<span class="badge">${tag}</span>`).join(" ")}</div>` : "Your tags will appear here as you organize your series.",
        network: "Your network is ready for people you follow and followers. Network features will appear here as you connect with members."
    };

    if (content) content.innerHTML = items[current[2]];

});

function renderActivityPage(user, content) {
    const movieFor = movieId => user.movieRecords?.[movieId] || movies.find(movie => String(movie.id) === String(movieId));
    const feed = [];
    (user.watched || []).slice().reverse().forEach(movieId => {
        const movie = movieFor(movieId);
        if (movie) feed.push({ type: "you", text: `<strong>You</strong> watched <a href="#" data-activity-movie="${movie.id}">${movie.title}</a>`, meta: "Recently" });
    });
    (user.watchlist || []).slice().reverse().forEach(movieId => {
        const movie = movieFor(movieId);
        if (movie) feed.push({ type: "you", text: `<strong>You</strong> added <a href="#" data-activity-movie="${movie.id}">${movie.title}</a> to your watchlist`, meta: "Recently" });
    });
    (user.likes || []).slice().reverse().forEach(movieId => {
        const movie = movieFor(movieId);
        if (movie) feed.push({ type: "you", text: `<strong>You</strong> liked <a href="#" data-activity-movie="${movie.id}">${movie.title}</a>`, meta: "Recently" });
    });
    (user.lists || []).slice().reverse().forEach(list => feed.push({ type: "you", text: `<strong>You</strong> created the list <a href="list-view.html?listId=${list.id}">${list.name}</a>`, meta: list.createdDate || "Recently" }));

    const render = filter => {
        const visible = feed.filter(item => filter === "all" || item.type === filter);
        content.innerHTML = visible.length ? visible.map(item => `<article class="activity-item"><div class="activity-item-avatar">${(user.avatar || user.username.charAt(0)).toUpperCase()}</div><div><p>${item.text}</p><time>${item.meta}</time></div></article>`).join("") : '<p class="dashboard-empty">No activity in this view yet.</p>';
        content.querySelectorAll("[data-activity-movie]").forEach(link => link.addEventListener("click", event => {
            event.preventDefault();
            const movie = movieFor(link.dataset.activityMovie);
            if (movie) showMovieModal(movie);
        }));
    };

    render("all");
    document.querySelectorAll("[data-activity-filter]").forEach(button => button.addEventListener("click", () => {
        document.querySelectorAll("[data-activity-filter]").forEach(item => item.classList.remove("is-active"));
        button.classList.add("is-active");
        render(button.dataset.activityFilter);
    }));

    const following = document.getElementById("activityFollowing");
    const users = Object.values(JSON.parse(localStorage.getItem("users") || "{}"));
    const followedUsers = (user.following || []).map(id => users.find(candidate => String(candidate.id) === String(id))).filter(Boolean);
    following.innerHTML = followedUsers.length ? followedUsers.map(candidate => `<a class="activity-following-user" href="profile.html?user=${candidate.id}"><span>${candidate.avatar || candidate.username.charAt(0).toUpperCase()}</span><strong>${candidate.username}</strong></a>`).join("") : '<p class="dashboard-empty">Follow members to see them here.</p>';
}

function renderDiaryPage(user, content) {
    const movieFor = movieId => user.movieRecords?.[movieId] || movies.find(movie => String(movie.id) === String(movieId));
    const now = new Date();
    const entries = (user.watched || []).map((movieId, index) => {
        const movie = movieFor(movieId);
        const date = new Date(now.getFullYear(), now.getMonth(), Math.max(1, now.getDate() - index));
        return movie ? { movie, date, rating: Number(user.ratings?.[movieId] || 0) } : null;
    }).filter(Boolean);

    const controls = ["diaryVisibility", "diarySort", "diaryGenre", "diaryDecade", "diaryYear", "diaryMonth"];
    const genreSelect = document.getElementById("diaryGenre");
    [...new Set(entries.flatMap(entry => String(entry.movie.genre || "Series").split(",").map(value => value.trim())))].filter(Boolean).forEach(genre => genreSelect.insertAdjacentHTML("beforeend", `<option value="${genre}">${genre}</option>`));
    const yearSelect = document.getElementById("diaryYear");
    [...new Set(entries.map(entry => entry.date.getFullYear()))].forEach(year => yearSelect.insertAdjacentHTML("beforeend", `<option value="${year}">${year}</option>`));
    const decadeSelect = document.getElementById("diaryDecade");
    [...new Set(entries.map(entry => `${Math.floor((Number(entry.movie.year) || 0) / 10) * 10}s`))].forEach(decade => decadeSelect.insertAdjacentHTML("beforeend", `<option value="${decade}">${decade}</option>`));

    const render = () => {
        const visibility = document.getElementById("diaryVisibility").value;
        const sort = document.getElementById("diarySort").value;
        const genre = document.getElementById("diaryGenre").value;
        const decade = document.getElementById("diaryDecade").value;
        const year = document.getElementById("diaryYear").value;
        const month = document.getElementById("diaryMonth").value;
        const visible = entries.filter(entry => {
            const genres = String(entry.movie.genre || "Series").split(",").map(value => value.trim());
            const entryDecade = `${Math.floor((Number(entry.movie.year) || 0) / 10) * 10}s`;
            return (visibility === "all" || (visibility === "rated" ? entry.rating > 0 : entry.rating === 0)) &&
                (genre === "all" || genres.includes(genre)) && (decade === "all" || entryDecade === decade) &&
                (year === "all" || String(entry.date.getFullYear()) === year) && (month === "all" || String(entry.date.getMonth()) === month);
        }).sort((a, b) => sort === "title" ? a.movie.title.localeCompare(b.movie.title) : sort === "rating" ? b.rating - a.rating : sort === "year" ? (Number(b.movie.year) || 0) - (Number(a.movie.year) || 0) : b.date - a.date);

        content.innerHTML = visible.length ? visible.map(entry => {
            const movie = entry.movie;
            const reviewed = Object.prototype.hasOwnProperty.call(user.ratings || {}, movie.id);
            return `<article class="diary-entry"><time>${entry.date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</time><button type="button" class="diary-poster" data-diary-movie="${movie.id}"><img src="${movie.poster}" alt="${movie.title}"></button><div class="diary-entry-info"><h2>${movie.title}</h2><p>${movie.year || ""} · ${movie.genre || "Series"}</p><div class="diary-entry-actions"><span class="diary-rating">${entry.rating ? `★ ${entry.rating.toFixed(1)}` : "Not rated"}</span><button type="button" data-diary-like="${movie.id}">♡ Like</button><button type="button" data-diary-rewatch="${movie.id}">↻ Rewatch</button><button type="button" data-diary-edit="${movie.id}">${reviewed ? "Read review" : "Edit this entry"}</button></div></div></article>`;
        }).join("") : '<p class="dashboard-empty">No diary entries match these filters.</p>';

        content.querySelectorAll("[data-diary-movie]").forEach(button => button.addEventListener("click", () => showMovieModal(movieFor(button.dataset.diaryMovie))));
        content.querySelectorAll("[data-diary-like]").forEach(button => button.addEventListener("click", () => toggleSeriesLike(movieFor(button.dataset.diaryLike))));
        content.querySelectorAll("[data-diary-rewatch]").forEach(button => button.addEventListener("click", () => showMessageDialog("Rewatch added to your diary.")));
        content.querySelectorAll("[data-diary-edit]").forEach(button => button.addEventListener("click", () => showMovieModal(movieFor(button.dataset.diaryEdit))));
    };

    controls.forEach(id => document.getElementById(id).addEventListener("change", render));
    render();
}
