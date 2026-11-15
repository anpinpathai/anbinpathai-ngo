// Two pieces of writing are "the same" when only the line endings or the spaces at the start and end differ.
// (A text box sends its lines separated by \r\n, while the standard wording is written with \n.)
function clean(text: string) {
  return text.replace(/\r\n?/g, "\n").trim();
}

export function sameWords(a: string, b: string) {
  return clean(a) === clean(b);
}
