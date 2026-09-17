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
// Comments are stored server-side via a Netlify Function backed by Netlify
// Blobs (see netlify/functions/comments.js), so every visitor sees the same
// list — unlike localStorage, which was scoped to each visitor's own browser.
const COMMENTS_ENDPOINT = "/.netlify/functions/comments";
const commentForm = document.getElementById("comment-form");
const commentList = document.getElementById("comment-list");
const commentEmpty = document.getElementById("comment-empty");

async function loadComments() {
  try {
    const res = await fetch(COMMENTS_ENDPOINT);
    if (!res.ok) throw new Error(`GET ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn("Gagal memuat komentar:", e);
    return null; // null = gagal fetch, beda dari [] = memang belum ada komentar
  }
}

async function postComment(name, message) {
  try {
    const res = await fetch(COMMENTS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, message }),
    });
    return res.ok;
  } catch (e) {
    console.warn("Gagal mengirim komentar:", e);
    return false;
  }
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
async function renderComments() {
  if (!commentList) return;
  const arr = await loadComments();
  if (arr === null) return; // fetch gagal — biarkan tampilan lama, jangan timpa dengan kosong

  const sorted = arr.slice().sort((a, b) => b.ts - a.ts);
  commentList.textContent = "";
  if (commentEmpty) commentEmpty.hidden = sorted.length > 0;

  sorted.forEach((c) => {
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
  commentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = commentForm.elements.name.value.trim();
    const message = commentForm.elements.message.value.trim();
    if (!name || !message) return;

    const submitBtn = commentForm.querySelector(".comment-submit");
    if (submitBtn) submitBtn.disabled = true;

    const ok = await postComment(name.slice(0, 60), message.slice(0, 800));

    if (submitBtn) submitBtn.disabled = false;

    if (!ok) {
      alert("Komentar gagal terkirim. Coba lagi sebentar lagi.");
      return;
    }

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
