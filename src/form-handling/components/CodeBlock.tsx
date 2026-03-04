import React from "react";
import { SYNTAX, FONT } from "../styles";

interface Token {
  text: string;
  color: string;
}

const KEYWORDS = new Set([
  "const",
  "return",
  "async",
  "await",
  "function",
  "import",
  "from",
  "try",
  "catch",
  "if",
  "else",
  "let",
  "var",
  "new",
  "type",
  "export",
  "default",
]);

const BUILTINS = new Set([
  "useState",
  "useActionState",
  "useFormStatus",
  "login",
  "setEmail",
  "setPass",
  "setLoading",
  "setError",
  "Object",
  "FormData",
  "console",
  "log",
  "fromEntries",
]);

const TAG_RE = /^<\/?[A-Z][A-Za-z]*/;
const HTML_TAG_RE = /^<\/?(?:form|input|button|div|p|br|span|a|label)\b/;
const ATTR_RE =
  /^(?:onClick|onSubmit|onChange|action|value|name|type|disabled|className|style|placeholder|formAction)\b/;

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < line.length) {
    // Whitespace
    if (line[i] === " " || line[i] === "\t") {
      let ws = "";
      while (i < line.length && (line[i] === " " || line[i] === "\t")) {
        ws += line[i];
        i++;
      }
      tokens.push({ text: ws, color: SYNTAX.text });
      continue;
    }

    // Comments
    if (line.slice(i, i + 2) === "//") {
      tokens.push({ text: line.slice(i), color: SYNTAX.comment });
      break;
    }

    // Strings
    if (line[i] === '"' || line[i] === "'" || line[i] === "`") {
      const quote = line[i];
      let str = quote;
      i++;
      while (i < line.length && line[i] !== quote) {
        if (line[i] === "\\" && i + 1 < line.length) {
          str += line[i] + line[i + 1];
          i += 2;
        } else {
          str += line[i];
          i++;
        }
      }
      if (i < line.length) {
        str += line[i];
        i++;
      }
      tokens.push({ text: str, color: SYNTAX.string });
      continue;
    }

    // JSX tags (component or html)
    if (line[i] === "<") {
      const tagMatch = line.slice(i).match(TAG_RE);
      const htmlMatch = line.slice(i).match(HTML_TAG_RE);
      if (tagMatch || htmlMatch) {
        const m = (tagMatch || htmlMatch)!;
        tokens.push({ text: m[0], color: SYNTAX.tag });
        i += m[0].length;
        continue;
      }
      // Closing > or />
      if (
        line.slice(i, i + 2) === "/>" ||
        line[i] === ">" ||
        line.slice(i, i + 2) === "</"
      ) {
        const end = line.slice(i, i + 2) === "/>" ? "/>" : line[i] === ">" ? ">" : "</";
        tokens.push({ text: end, color: SYNTAX.tag });
        i += end.length;
        continue;
      }
    }

    // Closing >
    if (line[i] === ">") {
      tokens.push({ text: ">", color: SYNTAX.tag });
      i++;
      continue;
    }

    // Closing />
    if (line.slice(i, i + 2) === "/>") {
      tokens.push({ text: "/>", color: SYNTAX.tag });
      i += 2;
      continue;
    }

    // Numbers
    if (/\d/.test(line[i]) && (i === 0 || !/\w/.test(line[i - 1]))) {
      let num = "";
      while (i < line.length && /[\d.]/.test(line[i])) {
        num += line[i];
        i++;
      }
      tokens.push({ text: num, color: SYNTAX.number });
      continue;
    }

    // Words (keywords, builtins, attributes)
    if (/[a-zA-Z_$]/.test(line[i])) {
      let word = "";
      while (i < line.length && /[a-zA-Z0-9_$]/.test(line[i])) {
        word += line[i];
        i++;
      }

      // Check attribute pattern
      const attrMatch = word.match(
        /^(?:onClick|onSubmit|onChange|action|value|name|type|disabled|className|style|placeholder|formAction)$/,
      );
      if (attrMatch && ATTR_RE.test(word)) {
        tokens.push({ text: word, color: SYNTAX.attr });
      } else if (KEYWORDS.has(word)) {
        tokens.push({ text: word, color: SYNTAX.keyword });
      } else if (BUILTINS.has(word) || word === "prev" || word === "formData") {
        tokens.push({ text: word, color: SYNTAX.fn });
      } else if (word === "null" || word === "true" || word === "false") {
        tokens.push({ text: word, color: SYNTAX.number });
      } else {
        tokens.push({ text: word, color: SYNTAX.text });
      }
      continue;
    }

    // JSX expressions and braces
    tokens.push({ text: line[i], color: SYNTAX.text });
    i++;
  }

  return tokens;
}

interface CodeBlockProps {
  code: string;
  fontSize?: number;
  lineHeight?: number;
  startLine?: number;
  maxLines?: number;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  fontSize = 14,
  lineHeight = 22,
  startLine = 0,
  maxLines,
}) => {
  let lines = code.split("\n");
  if (startLine > 0) lines = lines.slice(startLine);
  if (maxLines) lines = lines.slice(0, maxLines);

  return (
    <div
      style={{
        fontFamily: FONT.mono,
        fontSize,
        lineHeight: `${lineHeight}px`,
        whiteSpace: "pre",
        padding: "16px 20px",
      }}
    >
      {lines.map((line, idx) => (
        <div key={idx} style={{ height: lineHeight }}>
          {tokenizeLine(line).map((token, j) => (
            <span key={j} style={{ color: token.color }}>
              {token.text}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
};
