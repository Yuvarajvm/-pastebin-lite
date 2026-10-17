import hljs from "highlight.js/lib/common";

const languageAliases: Record<string, string> = { text: "", javascript: "javascript", typescript: "typescript", json: "json", python: "python", html: "xml", css: "css", sql: "sql", bash: "bash" };

export function highlightPaste(code: string, language: string) {
  const grammar = languageAliases[language];
  if (!grammar || !hljs.getLanguage(grammar)) return code.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  return hljs.highlight(code, { language: grammar, ignoreIllegals: true }).value;
}
