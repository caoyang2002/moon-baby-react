export async function writeRich(html: string, plain: string): Promise<"rich"|"plain"> {
  if (typeof ClipboardItem !== "undefined") {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html":  new Blob([html],  { type: "text/html"  }),
          "text/plain": new Blob([plain], { type: "text/plain" }),
        }),
      ]);
      return "rich";
    } catch { /* fall through */ }
  }
  await navigator.clipboard.writeText(plain);
  return "plain";
}

export async function writePlain(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}
