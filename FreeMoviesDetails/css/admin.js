document.addEventListener("DOMContentLoaded", function () {
    const ownerEmail = String(window.SITE_OWNER_EMAIL || "").trim().toLowerCase();
    const ownerPassword = String(window.SITE_OWNER_PASSWORD || "");
    const ownerName = String(window.SITE_OWNER_NAME || "admin");
    const loginForm = document.getElementById("ownerLoginForm");
    const loginPanel = document.getElementById("ownerLoginPanel");
    const dashboard = document.getElementById("ownerDashboard");
    const message = document.getElementById("ownerLoginMessage");
    const logoutButton = document.getElementById("ownerLogout");
    const adminUserPage = document.body.dataset.adminUserPage === "true";
    const adminHomePage = document.body.dataset.adminHome === "true";
    const loginTitle = document.getElementById("ownerLoginTitle");
    const homeTitle = document.getElementById("adminHomeTitle");

    if (loginTitle) loginTitle.textContent = `${ownerName} sign in`;
    if (homeTitle) homeTitle.textContent = `${ownerName} Home`;

    function getUsers() {
        try {
            return JSON.parse(localStorage.getItem("users")) || {};
        } catch (error) {
            return {};
        }
    }

    function renderUserDetails(user, target) {
        if (!user || !target) return;

        const lists = (user.lists || []).map(list => list.name || "Unnamed list").join(", ") || "None";
        const ratings = Object.keys(user.ratings || {}).length;
        target.innerHTML = `
            <h3>${user.username || "Unnamed user"}</h3>
            <p><strong>Email:</strong> ${user.email || "No email"}</p>
            <p><strong>Joined:</strong> ${user.joinDate || "Unknown"}</p>
            <p><strong>Bio:</strong> ${user.bio || "No bio"}</p>
            <p><strong>Privacy:</strong> ${user.privacy || "public"}</p>
            <p><strong>Films watched:</strong> ${(user.watched || []).length}</p>
            <p><strong>Watchlist:</strong> ${(user.watchlist || []).length}</p>
            <p><strong>Lists:</strong> ${lists}</p>
            <p><strong>Ratings:</strong> ${ratings}</p>
            <p><strong>Likes:</strong> ${(user.likes || []).length}</p>
            <p><strong>Tags:</strong> ${(user.tags || []).join(", ") || "None"}</p>
            <a class="link-btn" href="admin-home.html?email=${encodeURIComponent(user.email || "")}">Open user details</a>
        `;
        target.style.display = "block";
    }

    function renderDashboard() {
        const users = Object.values(getUsers());
        const table = document.getElementById("userTable");
        document.getElementById("userTotal").textContent = `${users.length} Registered User${users.length === 1 ? "" : "s"}`;

        if (!users.length) {
            table.innerHTML = '<div class="empty-state"><p>No registered users yet.</p></div>';
            return;
        }

        table.innerHTML = users.map(user => `
            <article class="movie-card" data-user-email="${encodeURIComponent(user.email || "")}" tabindex="0" role="button">
                <div class="movie-info">
                    <h3>${user.username || "Unnamed user"}</h3>
                    <p>${user.email || "No email"}</p>
                    <p>Joined: ${user.joinDate || "Unknown"}</p>
                    <p>Watched: ${(user.watched || []).length} · Watchlist: ${(user.watchlist || []).length}</p>
                    <p>Lists: ${(user.lists || []).length} · Ratings: ${Object.keys(user.ratings || {}).length}</p>
                    <p>Privacy: ${user.privacy || "public"}</p>
                </div>
            </article>
        `).join("");

        table.querySelectorAll("[data-user-email]").forEach(card => {
            const openDetails = () => {
                const email = decodeURIComponent(card.dataset.userEmail || "");
                renderUserDetails(getUsers()[email], document.getElementById("userDetail"));
            };
            card.addEventListener("click", openDetails);
            card.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") openDetails();
            });
        });
    }

    function openDashboard() {
        loginPanel.style.display = "none";
        dashboard.style.display = "block";
        logoutButton.style.display = "block";
        renderDashboard();
    }

    if (adminHomePage) {
        if (sessionStorage.getItem("ownerAccess") !== "true") {
            window.location.href = "admin.html";
            return;
        }
        document.getElementById("ownerLogout").addEventListener("click", function () {
            sessionStorage.removeItem("ownerAccess");
            window.location.href = "admin.html";
        });
        renderDashboard();
        return;
    }

    if (adminUserPage) {
        if (sessionStorage.getItem("ownerAccess") !== "true") {
            window.location.href = "admin.html";
            return;
        }

        const email = new URLSearchParams(window.location.search).get("email") || "";
        const user = getUsers()[email];
        const userHome = document.getElementById("userHomeContent");
        if (user) {
            renderUserDetails(user, userHome);
            userHome.style.display = "block";
        } else {
            userHome.innerHTML = "<p>User not found.</p>";
        }
        if (logoutButton) logoutButton.style.display = "block";
        if (logoutButton) logoutButton.addEventListener("click", function () {
            sessionStorage.removeItem("ownerAccess");
            window.location.href = "admin.html";
        });
        return;
    }

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const email = document.getElementById("ownerEmail").value.trim().toLowerCase();
        const password = document.getElementById("ownerPassword").value;
        const validOwnerCredentials = email === ownerEmail && password === ownerPassword;

        if (!ownerEmail || !validOwnerCredentials) {
            message.textContent = "Owner access denied.";
            return;
        }

        sessionStorage.setItem("ownerAccess", "true");
        window.location.href = "admin-home.html";
    });

    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            sessionStorage.removeItem("ownerAccess");
            window.location.href = "admin.html";
        });
    }

    if (sessionStorage.getItem("ownerAccess") === "true") {
        openDashboard();
    }
});
