export const DEFAULT_META = {
  title: "Integrit - Automate Growth",
  description:
    "AI workflows, smart plugins, and marketing services that scale your business on autopilot.",
};

function getMetaSelector(attribute: "name" | "property", value: string) {
  return `meta[${attribute}="${value}"]`;
}

export function setMetaTag(
  attribute: "name" | "property",
  value: string,
  content: string,
) {
  const selector = getMetaSelector(attribute, value);
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, value);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

export function removeMetaTag(attribute: "name" | "property", value: string) {
  document.head.querySelector(getMetaSelector(attribute, value))?.remove();
}
