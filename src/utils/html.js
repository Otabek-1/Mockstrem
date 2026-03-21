export function stripHtml(value) {
  return String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function sanitizeHtml(html) {
  if (!html) return "";
  if (typeof window === "undefined" || !window.DOMParser) return stripHtml(html);

  const parser = new window.DOMParser();
  const doc = parser.parseFromString(String(html), "text/html");

  doc.querySelectorAll("script, style, iframe, object, embed").forEach((node) => node.remove());
  doc.querySelectorAll("*").forEach((node) => {
    [...node.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = String(attr.value || "").trim().toLowerCase();

      if (name.startsWith("on")) {
        node.removeAttribute(attr.name);
        return;
      }

      if ((name === "href" || name === "src") && value.startsWith("javascript:")) {
        node.removeAttribute(attr.name);
      }
    });
  });

  return doc.body.innerHTML;
}
