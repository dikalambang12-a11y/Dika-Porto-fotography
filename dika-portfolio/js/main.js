// ---------- EN / ID language toggle ----------
const LANG_KEY = "dika-lang";
const langButtons = document.querySelectorAll(".lang-toggle button");

function setLang(lang) {
  document.querySelectorAll("[data-" + lang + "]").forEach((el) => {
    el.textContent = el.getAttribute("data-" + lang);
  });
  document.querySelectorAll("[data-" + lang + "-ph]").forEach((el) => {
    el.setAttribute("placeholder", el.getAttribute("data-" + lang + "-ph"));
  });
  document.documentElement.lang = lang;
  if (typeof renderComments === "function") renderComments();
  document.title =
    lang === "en"
      ? "Dika — Portrait & Documentary Photography"
      : "Dika — Fotografi Potret & Dokumenter";
  langButtons.forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.lang === lang));
  });
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch (e) {
    /* private mode: toggle still works, just not persisted */
  }
}

langButtons.forEach((btn) => {
  btn.addEventListener("click", () => setLang(btn.dataset.lang));
});

let savedLang = "id";
try {
  savedLang = localStorage.getItem(LANG_KEY) || "id";
} catch (e) {}
if (savedLang !== "id") setLang(savedLang);

// ---------- comments / guestbook ----------
// Stored locally in this browser. To share comments across visitors, wire
// loadComments()/saveComments() to a backend (see the secure options Dika was given).
const COMMENTS_KEY = "dika-comments";
const commentForm = document.getElementById("comment-form");
const commentList = document.getElementById("comment-list");
const commentEmpty = document.getElementById("comment-empty");

function loadComments() {
  try {
    return JSON.parse(localStorage.getItem(COMMENTS_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveComments(arr) {
  try {
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(arr));
  } catch (e) {}
}

function formatCommentDate(ts) {
  const locale = document.documentElement.lang === "en" ? "en-GB" : "id-ID";
  return new Date(ts).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// textContent everywhere below — never innerHTML — so user input can't inject markup.
function renderComments() {
  if (!commentList) return;
  const arr = loadComments()
    .slice()
    .sort((a, b) => b.ts - a.ts);
  commentList.textContent = "";
  if (commentEmpty) commentEmpty.hidden = arr.length > 0;

  arr.forEach((c) => {
    const li = document.createElement("li");
    li.className = "comment";

    const meta = document.createElement("p");
    meta.className = "comment-meta mono";
    const name = document.createElement("span");
    name.className = "comment-name";
    name.textContent = c.name;
    const date = document.createElement("span");
    date.className = "comment-date";
    date.textContent = formatCommentDate(c.ts);
    meta.append(name, date);

    const body = document.createElement("p");
    body.className = "comment-body";
    body.textContent = c.message;

    li.append(meta, body);
    commentList.appendChild(li);
  });
}

if (commentForm) {
  commentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = commentForm.elements.name.value.trim();
    const message = commentForm.elements.message.value.trim();
    if (!name || !message) return;
    const arr = loadComments();
    arr.push({
      name: name.slice(0, 60),
      message: message.slice(0, 800),
      ts: Date.now(),
    });
    saveComments(arr);
    commentForm.reset();
    renderComments();
  });
  renderComments();
}

// ---------- scroll reveal ----------
const revealEls = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );
  revealEls.forEach((el) => observer.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("visible"));
}
