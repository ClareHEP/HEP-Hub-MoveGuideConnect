/*
 * Shared app-shell chrome for every logged-in page.
 * Renders both the persistent-rail/tab-bar layout ("rail", nav model 1b)
 * and the hub-first top-bar layout ("top", nav model 1a) from the same
 * markup, mounted into placeholder elements each page provides:
 *   <div id="shell"></div>                    - rail sidebar (rail mode, desktop)
 *   <header id="topbar-mount"></header>        - top bar (top mode always; rail mode, mobile)
 *   <div id="tabbar-mount"></div>              - bottom tab bar (rail mode, mobile)
 *   <span id="nav-toggle-mount"></span>        - footer control to switch layouts
 * Which mode is active is stored in localStorage so the choice persists
 * and applies across every page, and can be overridden per-visit with
 * ?nav=top or ?nav=rail.
 */
(function () {
  "use strict";

  var STORE_KEY_NAV = "hephub_nav_mode";
  var STORE_KEY_NAME = "hephub_client_name";
  var DEFAULT_NAME = "John Smith";

  var SITE_URL = "https://www.hobartexercisephysiology.com.au";

  var NAV_ITEMS = [
    { key: "home", label: "Home", href: "welcome.html", dot: "#4A9BD8" },
    { key: "move", label: "Move", href: "move.html", dot: "#FF9A53" },
    { key: "guide", label: "Guide", href: "guide.html", dot: "#4A9BD8" },
    { key: "connect", label: "Connect", href: "connect.html", dot: "#4A87AD" },
    { key: "program", label: "My Program", href: "program.html", dot: "#E3E7EA", tabLabel: "Program" },
    { key: "contact", label: "Contact Us", href: SITE_URL, dot: "#6B7684", external: true, tabLabel: "Contact" }
  ];

  function getNavMode() {
    var params = new URLSearchParams(window.location.search);
    var fromUrl = params.get("nav");
    if (fromUrl === "top" || fromUrl === "rail") {
      localStorage.setItem(STORE_KEY_NAV, fromUrl);
      return fromUrl;
    }
    return localStorage.getItem(STORE_KEY_NAV) === "top" ? "top" : "rail";
  }

  function getClientName() {
    return (localStorage.getItem(STORE_KEY_NAME) || "").trim();
  }

  function getInitials() {
    var name = getClientName() || DEFAULT_NAME;
    var parts = name.split(/\s+/).filter(Boolean);
    var initials = parts.slice(0, 2).map(function (p) { return p[0].toUpperCase(); }).join("");
    return initials || "H";
  }

  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "class") e.className = attrs[k];
        else if (k === "text") e.textContent = attrs[k];
        else e.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (c) { e.appendChild(c); });
    return e;
  }

  function buildRail(page) {
    var rail = el("div", { class: "rail" });
    rail.appendChild(el("img", { class: "rail-logo", src: "assets/hep-logo-dark.png", alt: "Hobart Exercise Physiology" }));

    var navWrap = el("div", { class: "rail-nav" });
    NAV_ITEMS.forEach(function (item) {
      var isActive = item.key === page;
      var dot = el("div", { class: "dot", style: "background:" + (isActive ? "#fff" : item.dot) + ";" });
      var attrs = { class: "rail-link" + (isActive ? " active" : ""), href: item.href };
      if (item.external) { attrs.target = "_blank"; attrs.rel = "noopener"; }
      var link = el("a", attrs, [
        dot,
        document.createTextNode(item.label)
      ]);
      navWrap.appendChild(link);
    });
    rail.appendChild(navWrap);

    var foot = el("div", { class: "rail-foot" });
    foot.appendChild(el("div", { class: "avatar", text: getInitials() }));
    var who = el("div", { class: "who" });
    who.appendChild(el("div", { class: "name", text: getClientName() || DEFAULT_NAME }));
    var logoutBtn = el("button", { class: "logout", type: "button", text: "Log out" });
    logoutBtn.addEventListener("click", function () { window.location.href = "index.html"; });
    who.appendChild(logoutBtn);
    foot.appendChild(who);
    rail.appendChild(foot);

    return rail;
  }

  function buildTopbar(page) {
    var bar = el("div", { class: "topbar" });

    var brand = el("a", { class: "topbar-brand", href: "welcome.html" });
    brand.appendChild(el("img", { src: "assets/hep-mark.png", alt: "" }));
    var word = el("div", { class: "topbar-word" });
    word.appendChild(el("span", { class: "l1", text: "HOBART" }));
    word.appendChild(el("span", { class: "l2", text: "EXERCISE · PHYSIOLOGY" }));
    brand.appendChild(word);
    bar.appendChild(brand);

    bar.appendChild(el("span", { class: "topbar-tag", text: "Member Hub" }));

    var right = el("div", { class: "topbar-right" });
    var links = el("div", { class: "topbar-links" });

    var homeLink = el("span", { class: page === "home" ? "active" : "" }, [document.createTextNode("Home")]);
    homeLink.addEventListener("click", function () { window.location.href = "welcome.html"; });
    var supportLink = el("span", { text: "Support" });
    var logoutLink = el("span", { text: "Log out" });
    logoutLink.addEventListener("click", function () { window.location.href = "index.html"; });

    links.appendChild(homeLink);
    links.appendChild(supportLink);
    links.appendChild(logoutLink);
    right.appendChild(links);
    right.appendChild(el("div", { class: "avatar", text: getInitials() }));
    bar.appendChild(right);

    return bar;
  }

  function buildTabbar(page) {
    var bar = el("div", { class: "tabbar" });
    NAV_ITEMS.forEach(function (item) {
      var isActive = item.key === page;
      var attrs = { class: "tab-item" + (isActive ? " active" : ""), href: item.href };
      if (item.external) { attrs.target = "_blank"; attrs.rel = "noopener"; }
      var a = el("a", attrs);
      a.appendChild(el("div", { class: "dot" }));
      a.appendChild(el("span", { text: item.tabLabel || item.label }));
      bar.appendChild(a);
    });
    return bar;
  }

  function buildToggle(mode) {
    var btn = el("button", { class: "nav-toggle", type: "button" });
    btn.textContent = mode === "rail" ? "Switch to hub-first nav" : "Switch to always-on nav";
    btn.addEventListener("click", function () {
      localStorage.setItem(STORE_KEY_NAV, mode === "rail" ? "top" : "rail");
      window.location.reload();
    });
    return btn;
  }

  function init() {
    var page = document.body.getAttribute("data-page") || "";
    var mode = getNavMode();
    document.body.setAttribute("data-nav", mode);

    var shell = document.getElementById("shell");
    var topbarMount = document.getElementById("topbar-mount");
    var tabbarMount = document.getElementById("tabbar-mount");
    var toggleMount = document.getElementById("nav-toggle-mount");

    if (shell) shell.appendChild(buildRail(page));
    if (topbarMount) topbarMount.appendChild(buildTopbar(page));
    if (tabbarMount) tabbarMount.appendChild(buildTabbar(page));
    if (toggleMount) toggleMount.appendChild(buildToggle(mode));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
