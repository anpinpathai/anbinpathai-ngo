// Copies text to the clipboard. Returns false when the browser does not allow it.
// First the modern way; if that is refused (older browsers, some phones), the older way with a hidden text box.
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // fall through to the older way
  }

  try {
    const box = document.createElement("textarea");
    box.value = text;
    box.setAttribute("readonly", "");
    box.style.cssText = "position:fixed;top:0;left:-9999px;opacity:0";
    document.body.appendChild(box);
    box.select();
    const copied = document.execCommand("copy");
    box.remove();
    return copied;
  } catch {
    return false;
  }
}
