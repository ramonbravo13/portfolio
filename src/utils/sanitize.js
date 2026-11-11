const BLOCKED_TAGS = new Set([
  'script', 'iframe', 'object', 'embed', 'form', 'input', 'button',
  'textarea', 'select', 'meta', 'link', 'style', 'base', 'applet', 'math', 'svg'
]);

const URL_ATTRIBUTES = new Set(['href', 'src', 'xlink:href', 'action', 'formaction']);

/**
 * Validates that a URL uses a safe protocol (http, https, mailto, tel, or relative path).
 */
export function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Allow relative paths or anchor links
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed, window.location.origin);
    if (['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
      return trimmed;
    }
    return '#';
  } catch {
    return '#';
  }
}

/**
 * Sanitizes HTML strings before rendering via dangerouslySetInnerHTML
 * to prevent Stored/DOM Cross-Site Scripting (XSS).
 */
export function sanitizeHtml(dirtyHtml) {
  if (!dirtyHtml || typeof dirtyHtml !== 'string') return '';

  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return dirtyHtml.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(dirtyHtml, 'text/html');

  const cleanNode = (node) => {
    const children = Array.from(node.childNodes);
    for (const child of children) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const tagName = child.tagName.toLowerCase();
        if (BLOCKED_TAGS.has(tagName)) {
          child.remove();
          continue;
        }

        // Remove inline event handlers (onload, onerror, onclick, etc.) and unsafe URLs
        const attrs = Array.from(child.attributes);
        for (const attr of attrs) {
          const attrName = attr.name.toLowerCase();
          const attrVal = attr.value.trim().toLowerCase();

          if (attrName.startsWith('on') || attrName === 'srcdoc') {
            child.removeAttribute(attr.name);
          } else if (URL_ATTRIBUTES.has(attrName)) {
            if (
              attrVal.startsWith('javascript:') ||
              attrVal.startsWith('vbscript:') ||
              attrVal.startsWith('data:text/html')
            ) {
              child.removeAttribute(attr.name);
            }
          }
        }

        // Ensure external links opened in new tab have rel="noopener noreferrer"
        if (tagName === 'a' && child.getAttribute('target') === '_blank') {
          child.setAttribute('rel', 'noopener noreferrer');
        }

        cleanNode(child);
      }
    }
  };

  cleanNode(doc.body);
  return doc.body.innerHTML;
}

