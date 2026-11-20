(function () {
  // Event day: 21st November 2026 (month is 0-indexed: 10 = November)
  const EVENT_DATE = { year: 2026, month: 10, day: 21 };

  const dayStart = new Date(EVENT_DATE.year, EVENT_DATE.month, EVENT_DATE.day, 0, 0, 0);
  const dayEnd = new Date(EVENT_DATE.year, EVENT_DATE.month, EVENT_DATE.day + 1, 0, 0, 0);
  const now = new Date();
  if (now < dayStart || now >= dayEnd) return;

  const speakers = document.querySelector(".speakers-section");
  const stream = document.querySelector(".stream-section");
  if (!speakers || !stream) return;

  // Livestream goes up, speakers slider drops directly below it.
  // Navbar, ticker, title and everything else stay where they are.
  speakers.parentNode.insertBefore(stream, speakers);
  // Partners strip stays directly under the livestream.
  const partners = document.querySelector(".partners-section");
  if (partners) speakers.parentNode.insertBefore(partners, speakers);

  // Pulsing "live" dot on the Watch Live button, and a note swap.
  document.body.classList.add("is-live");
  const sub = stream.querySelector(".sub");
  if (sub) sub.textContent = "We're live now — kindly follow us on all social media platforms.";
})();
