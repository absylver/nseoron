/* Livestream player.
   1. Shows STREAM_URL (top of index.html) straight away.
   2. If STREAM_SHEET_ID is set, reads cell A2 of that Google Sheet and
      re-checks every 30 seconds, so the video can be changed from the
      Google Sheets app without touching the code or redeploying.
   Accepts YouTube or Facebook links. Bad or empty values are ignored. */
(function () {
  const frame = document.getElementById("stream-player");
  if (!frame) return;

  const CHECK_EVERY_MS = 30000;
  let current = "";

  function youtubeId(u) {
    const host = u.hostname.replace(/^www\.|^m\./, "");
    if (host === "youtu.be") return u.pathname.split("/")[1];
    if (host.endsWith("youtube.com")) {
      if (u.searchParams.get("v")) return u.searchParams.get("v");
      const m = u.pathname.match(/^\/(?:live|embed|shorts)\/([^/?#]+)/);
      if (m) return m[1];
    }
    return null;
  }

  function isFacebook(u) {
    const host = u.hostname.replace(/^www\.|^m\.|^web\./, "");
    return host === "facebook.com" || host === "fb.watch";
  }

  // Returns an embed URL, or null if the link isn't YouTube/Facebook.
  function toEmbed(raw) {
    try {
      const u = new URL(String(raw).trim());
      const id = youtubeId(u);
      if (id) return "https://www.youtube.com/embed/" + encodeURIComponent(id);
      if (isFacebook(u)) {
        u.hostname = u.hostname.replace(/^m\.|^web\./, "www.");
        return "https://www.facebook.com/plugins/video.php?href=" +
               encodeURIComponent(u.origin + u.pathname) +
               "&show_text=false&width=1280";
      }
    } catch (e) {}
    return null;
  }

  // Only reload the player when the link actually changes,
  // so viewers who are already watching aren't interrupted.
  function show(raw) {
    const src = toEmbed(raw);
    if (!src || src === current) return;
    current = src;
    frame.src = src;
  }

  show(window.STREAM_URL || "");

  const sheetId = (window.STREAM_SHEET_ID || "").trim();
  if (!sheetId) return;

  function check() {
    const url = "https://docs.google.com/spreadsheets/d/" + encodeURIComponent(sheetId) +
                "/gviz/tq?tqx=out:csv&range=A2&t=" + Date.now();
    fetch(url, { cache: "no-store" })
      .then(function (r) { return r.ok ? r.text() : ""; })
      .then(function (text) { show(text.replace(/^"|"\s*$/g, "").replace(/""/g, '"')); })
      .catch(function () { /* keep whatever is playing */ });
  }

  check();
  setInterval(check, CHECK_EVERY_MS);
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) check();
  });
})();
