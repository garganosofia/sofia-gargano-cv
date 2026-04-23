(function () {
  const root = document.getElementById("wa-dock");
  if (!root) return;
  const fab = root.querySelector(".wa-dock__fab");
  const panel = root.querySelector(".wa-dock__panel");
  const closeBtn = root.querySelector(".wa-dock__close");

  function setOpen(open) {
    root.classList.toggle("wa-dock--open", open);
    if (fab) fab.setAttribute("aria-expanded", open ? "true" : "false");
    if (panel) panel.toggleAttribute("hidden", !open);
  }

  function toggle() {
    setOpen(!root.classList.contains("wa-dock--open"));
  }

  if (fab) {
    fab.addEventListener("click", (e) => {
      e.stopPropagation();
      toggle();
    });
  }
  if (closeBtn) closeBtn.addEventListener("click", () => setOpen(false));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  document.addEventListener("click", (e) => {
    if (!root.classList.contains("wa-dock--open")) return;
    if (!root.contains(e.target)) setOpen(false);
  });
})();
