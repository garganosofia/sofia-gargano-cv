(function () {
  function initDock(rootId) {
    const root = document.getElementById(rootId);
    if (!root) return;
    const fab = root.querySelector("[data-dock-fab]") || root.querySelector(".wa-dock__fab");
    const panel = root.querySelector("[data-dock-panel]") || root.querySelector(".wa-dock__panel");
    const closeBtn = root.querySelector("[data-dock-close]") || root.querySelector(".wa-dock__close");
    const openClass = root.dataset.dockOpenClass || "wa-dock--open";

    function setOpen(open) {
      root.classList.toggle(openClass, open);
      if (fab) fab.setAttribute("aria-expanded", open ? "true" : "false");
      if (panel) panel.toggleAttribute("hidden", !open);
      if (open) closeOthers(root);
    }

    function toggle() {
      setOpen(!root.classList.contains(openClass));
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
      if (!root.classList.contains(openClass)) return;
      if (!root.contains(e.target)) setOpen(false);
    });

    root._closeDock = () => setOpen(false);
  }

  function closeOthers(current) {
    document.querySelectorAll("[data-dock]").forEach((el) => {
      if (el !== current && typeof el._closeDock === "function") el._closeDock();
    });
  }

  initDock("wa-dock");
  initDock("apps-dock");
})();
