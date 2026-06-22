(function () {
  try {
    const stored = localStorage.getItem("theme");
    const prefersLight =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    const theme = stored || (prefersLight ? "light" : "dark");
    const el = document.documentElement;
    if (theme === "light") {
      el.classList.remove("dark");
      el.classList.add("light");
    } else {
      el.classList.add("dark");
      el.classList.remove("light");
    }
  } catch (e) {}
})();
