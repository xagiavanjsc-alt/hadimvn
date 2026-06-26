export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === "undefined") return false;

  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall back below
  }

  if (typeof document === "undefined") return false;

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "-9999px";
  textarea.setAttribute("aria-hidden", "true");

  document.body.appendChild(textarea);
  textarea.select();

  try {
    return document.execCommand("copy") === true;
  } catch {
    return false;
  } finally {
    if (textarea.parentNode) {
      textarea.parentNode.removeChild(textarea);
    }
  }
}

export function openExternalUrl(url: string): void {
  if (typeof window === "undefined") return;

  try {
    const popup = window.open(url, "_blank", "noopener,noreferrer");
    if (!popup) {
      window.location.href = url;
    }
  } catch {
    window.location.href = url;
  }
}
