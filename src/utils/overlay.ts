const el = document.getElementById("overlay");
const docEl = document.documentElement;
const needsPadding = !(window.CSS && CSS.supports("scrollbar-gutter: stable"));

function getScrollbarWidth() {
  return Math.max(0, window.innerWidth - docEl.clientWidth);
}

if (el) {
  document.addEventListener("show-overlay", () => {
    if (needsPadding) {
      docEl.style.setProperty("--sbw", `${getScrollbarWidth()}px`);
    }
    docEl.classList.add("overlay-open");
    el.classList.remove("opacity-0", "invisible", "pointer-events-none");
  });

  document.addEventListener("hide-overlay", () => {
    docEl.classList.remove("overlay-open");
    el.classList.add("opacity-0", "invisible", "pointer-events-none");
    if (needsPadding) docEl.style.removeProperty("--sbw");
  });

  el.addEventListener("click", () => {
    document.dispatchEvent(new CustomEvent("overlay-clicked"));
  });
}
