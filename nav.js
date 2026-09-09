/*
 * Shared app-shell chrome for every logged-in page.
 * One nav model: a persistent rail on desktop, a top bar plus bottom tab bar
 * on mobile. Mounted into placeholder elements each page provides:
 *   <div id="shell"></div>              - rail sidebar (desktop)
 *   <header id="topbar-mount"></header> - top bar (mobile)
 *   <div id="tabbar-mount"></div>       - bottom tab bar (mobile)
 */
(function () {
  "use strict";

  var STORE_KEY_NAME = "hephub_client_name";
  var DEFAULT_NAME = "John Smith";

  var SITE_URL = "https://www.hobartexercisephysiology.com.au";

  var NAV_ITEMS = [
    { key: "home", label: "Home", href: "welcome.html", dot: "#4A9BD8" },
    { key: "move", label: "Move", href: "move.html", dot: "#FF9A53" },
    { key: "guide", label: "Guide", href: "guide.html", dot: "#4A9BD8" },
    { key: "connect", label: "Connect", href: "connect.html", dot: "#4A87AD" },
    { key: "contact", label: "Contact Us", href: SITE_URL, dot: "#6B7684", external: true, tabLabel: "Contact" }
  ];

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

  function buildTopbar() {
    var bar = el("div", { class: "topbar" });

    var brand = el("a", { class: "topbar-brand", href: "welcome.html" });
    brand.appendChild(el("img", { src: "assets/hep-mark.png", alt: "" }));
    var word = el("div", { class: "topbar-word" });
    word.appendChild(el("span", { class: "l1", text: "HOBART" }));
    word.appendChild(el("span", { class: "l2", text: "EXERCISE · PHYSIOLOGY" }));
    brand.appendChild(word);
    bar.appendChild(brand);

    var right = el("div", { class: "topbar-right" });
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

  function init() {
    var page = document.body.getAttribute("data-page") || "";

    var shell = document.getElementById("shell");
    var topbarMount = document.getElementById("topbar-mount");
    var tabbarMount = document.getElementById("tabbar-mount");

    if (shell) shell.appendChild(buildRail(page));
    if (topbarMount) topbarMount.appendChild(buildTopbar());
    if (tabbarMount) tabbarMount.appendChild(buildTabbar(page));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
