// Theme Switcher.

if (window.localStorage.getItem("heimdall-color") === "dark") {
    document.body.classList.add("dark");
    document.body.classList.remove("light");
} else {
    document.body.classList.add("light");
    document.body.classList.remove("dark");
}

const mainNavbar = document.getElementById("main-navbar");
if (window.scrollY > 0) mainNavbar.classList.add("navbar-sticky");
else mainNavbar.classList.remove("navbar-sticky");

const lightButton = document.getElementById("to-light");
const darkButton = document.getElementById("to-dark");

lightButton.addEventListener("click", () => {
    document.body.classList.add("light");
    document.body.classList.remove("dark");
    window.localStorage.setItem("heimdall-color", "light");
});

darkButton.addEventListener("click", () => {
    document.body.classList.add("dark");
    document.body.classList.remove("light");
    window.localStorage.setItem("heimdall-color", "dark");
});

window.addEventListener("scroll", () => {
    if (window.scrollY > 0) mainNavbar.classList.add("navbar-sticky");
    else mainNavbar.classList.remove("navbar-sticky");
});

// Profile Dropdown.

const dropdownBtn = document.getElementById("profile-dropdown-btn");
const dropdown = document.getElementById("profile-dropdown");

if (dropdownBtn) {
    dropdownBtn.addEventListener("click", () => {
        if (dropdown.classList.contains("opacity-0")) {
            dropdown.classList.add("opacity-100");
            dropdown.classList.add("pointer-events-auto");
            dropdown.classList.remove("opacity-0");
            dropdown.classList.remove("pointer-events-none");
        } else {
            dropdown.classList.add("opacity-0");
            dropdown.classList.add("pointer-events-none");
            dropdown.classList.remove("opacity-100");
            dropdown.classList.remove("pointer-events-auto");
        }
    });
}

// Mobile Menu.

const mobileMenu = document.getElementById("mobile-menu");
const mobileMenuBtn = document.getElementById("mobile-menu-btn");

if (mobileMenu && mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", () => {
        if (mobileMenu.classList.contains("opacity-0")) {
            mobileMenu.classList.add("opacity-100");
            mobileMenu.classList.add("pointer-events-auto");
            mobileMenu.classList.remove("opacity-0");
            mobileMenu.classList.remove("pointer-events-none");
            mainNavbar.classList.add("mobile-menu-open");
        } else {
            mobileMenu.classList.add("opacity-0");
            mobileMenu.classList.add("pointer-events-none");
            mobileMenu.classList.remove("opacity-100");
            mobileMenu.classList.remove("pointer-events-auto");
            mainNavbar.classList.remove("mobile-menu-open");
        }
    });
}

// Search.

const buttons = document.querySelectorAll(".search-btn");
const searchSuggestions = document.getElementById("search-suggestions");
const searchPanel = document.getElementById("search-panel");
const searchInput = document.getElementById("search-input");
const searchEmpty = document.getElementById("search-empty");
const searchResults = document.getElementById("search-results");
const searchLoading = document.getElementById("search-loading");
const searchCountWrapper = document.getElementById("search-results-count-wrapper");
const searchCount = document.getElementById("search-results-count");

buttons.forEach((button) => {
    button.addEventListener("click", () => {
        if (Array.from(searchPanel.classList).includes("visible")) {
            searchPanel.classList.remove("visible");
            document.onkeydown = undefined;
        } else {
            searchPanel.classList.add("visible");
            searchInput.focus();

            // Exit on ESC.

            document.onkeydown = function (event) {
                if (event.key === "Escape") searchPanel.classList.remove("visible");
                if (event.key === "Enter") {
                    const firstResult = document.querySelector(
                        "#search-results > a:first-child"
                    );
                    if (firstResult) window.location = firstResult.getAttribute("href");
                }
            };
        }
    });
});

const ghostSearch = new GhostSearch({
    key: SEARCH_API_KEY,
    url: SEARCH_API_URL,
    host: SEARCH_API_URL,
    input: "#search-input",
    results: "#search-results",
    template: (result) => {
        const url = [location.protocol, "//", location.host].join("");
        const postUrl = `${url}/${result.slug}`;
        const primary_author = result.authors[0];
        return `
            <a href="${postUrl}" class="pt-4 group block col-span-4">
                <h6 class="text-black dark:text-white group-hover:text-primary dark:group-hover:text-primary transition-colors">${result.title}</h6>
                <span class="text-black dark:text-white text-xs transition-colors">
                    <span class="font-serif italic" style="font-size: 10px; margin-right: 2px;">by</span>
                    <span class="transition-all font-sans font-bold">${primary_author.name}</span>
                </span>
            </a>
        `;
    },
    api: {
        resource: "posts",
        parameters: {
            limit: "all",
            fields: ["title", "slug", "excerpt"],
            include: "authors",
        },
    },
    on: {
        afterDisplay: (results) => {
            if (searchInput.value.length > 0) {
                searchSuggestions.classList.add("hidden");
                if (results.length > 0) {
                    searchResults.classList.remove("hidden");
                    searchEmpty.classList.add("hidden");
                } else {
                    searchResults.classList.add("hidden");
                    searchEmpty.classList.remove("hidden");
                }
                searchCountWrapper.classList.remove("hidden");
                searchCount.innerText = results.length;
            } else {
                searchCountWrapper.classList.add("hidden");
                searchResults.classList.add("hidden");
                searchSuggestions.classList.remove("hidden");
                searchEmpty.classList.add("hidden");
            }
        },
        beforeFetch: () => {
            searchLoading.classList.remove("hidden");
        },
        afterFetch: () => {
            searchLoading.classList.add("hidden");
        },
    },
});

// Gallery Calculation.

document.querySelectorAll(".kg-gallery-image img").forEach(function (image) {
    const wrapper = image.closest(".kg-gallery-image");
    wrapper.style.flex =
        image.attributes.width.value / image.attributes.height.value + " 1 0%";
});

// Lightbox setup.

function wrap(element, wrapper) {
    element.parentNode.insertBefore(wrapper, element);
    wrapper.appendChild(element);
}

const galleryElements = document.querySelectorAll(".kg-gallery-image > img");
galleryElements.forEach((element) => {
    const wrapper = document.createElement("a");
    wrapper.setAttribute(
        "class",
        "post-gallery cursor-pointer shadow-md hover:shadow-2xl transition-all"
    );
    wrapper.setAttribute("href", element.getAttribute("src"));
    wrap(element, wrapper);
});

if (galleryElements.length > 0) halkaBox.run("post-gallery");

// Responsive iFrame Videos.

const players = ['iframe[src*="youtube.com"]', 'iframe[src*="vimeo.com"]'];
const videoIframes = document.querySelectorAll(players.join(","));

if (videoIframes.length) {
    for (let i = 0; i < videoIframes.length; i++) {
        const iframe = videoIframes[i];
        const width = iframe.getAttribute("width");
        const height = iframe.getAttribute("height");
        const aspectRatio = height / width;
        const parentDiv = iframe.parentNode;

        const div = document.createElement("div");
        div.className = "video-iframe-wrapper";
        div.style.paddingBottom = aspectRatio * 100 + "%";
        parentDiv.insertBefore(div, iframe);
        iframe.remove();
        div.appendChild(iframe);

        iframe.removeAttribute("height");
        iframe.removeAttribute("width");
    }
}

// Infinite Scroll.

(function (window, document) {
    const loaderWrapper = document.getElementById("pagination-wrapper");
    if (!loaderWrapper) return;

    const loaderElement = document.querySelector("#load-more");
    if (!loaderElement) return;

    const nextElement = document.querySelector("link[rel=next]");
    if (!nextElement) return;

    const feedElement = document.querySelector(".post-loop-wrapper");
    if (!feedElement) return;

    let loading = false;

    function onPageLoad() {
        const postElements = this.response.querySelectorAll(".post-loop-wrapper > div");
        postElements.forEach(function (item) {
            const node = document.importNode(item, true);
            node.classList.add("fadeInUp");
            feedElement.appendChild(node);
        });

        const resNextElement = this.response.querySelector("link[rel=next]");
        if (resNextElement) {
            nextElement.href = resNextElement.href;
        } else {
            loaderWrapper.style.display = "none";
        }

        loading = false;
        loaderElement.classList.remove("loading");
    }

    function loadMore() {
        if (loading) return;
        loading = true;
        loaderElement.classList.add("loading");
        const xhr = new window.XMLHttpRequest();
        xhr.responseType = "document";
        xhr.addEventListener("load", onPageLoad);
        xhr.open("GET", nextElement.href);
        xhr.send(null);
    }

    loaderElement.addEventListener("click", loadMore);
})(window, document);
