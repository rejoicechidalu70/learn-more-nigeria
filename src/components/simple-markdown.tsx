import { Fragment, type ReactNode } from "react";

// Tiny markdown renderer with no regex lookbehind, so it works on older
// iPhone Safari (iOS 15), where the full markdown library crashes the page.
function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*|_[^_\s][^_]*_)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const t = m[0];
    const k = `${keyBase}-${i++}`;
    if (t.startsWith("**")) out.push(<strong key={k}>{t.slice(2, -2)}</strong>);
    else if (t.startsWith("`")) out.push(<code key={k} className="rounded bg-muted px-1 text-[0.9em]">{t.slice(1, -1)}</code>);
    else out.push(<em key={k}>{t.slice(1, -1)}</em>);
    last = m.index + t.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function SimpleMarkdown({ children }: { children: string }) {
  const lines = children.replace(/\r/g, "").split("\n");
  const blocks: ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let code: string[] | null = null;
  let para: string[] = [];

  const flushPara = () => {
    if (para.length) {
      const k = `p${blocks.length}`;
      blocks.push(
        <p key={k} className="leading-relaxed">
          {para.map((l, i) => (
            <Fragment key={i}>
              {i > 0 && <br />}
              {inline(l, `${k}-${i}`)}
            </Fragment>
          ))}
        </p>,
      );
      para = [];
    }
  };
  const flushList = () => {
    if (list) {
      const k = `l${blocks.length}`;
      const items = list.items.map((it, i) => <li key={i}>{inline(it, `${k}-${i}`)}</li>);
      blocks.push(
        list.ordered ? (
          <ol key={k} className="list-decimal space-y-1 pl-5">{items}</ol>
        ) : (
          <ul key={k} className="list-disc space-y-1 pl-5">{items}</ul>
        ),
      );
      list = null;
    }
  };

  for (const raw of lines) {
    if (code) {
      if (raw.trim().startsWith("```")) {
        blocks.push(
          <pre key={`c${blocks.length}`} className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
            <code>{code.join("\n")}</code>
          </pre>,
        );
        code = null;
      } else code.push(raw);
      continue;
    }
    const line = raw.trimEnd();
    if (line.trim().startsWith("```")) {
      flushPara();
      flushList();
      code = [];
      continue;
    }
    if (!line.trim()) {
      flushPara();
      flushList();
      continue;
    }
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      flushPara();
      flushList();
      blocks.push(
        <p key={`h${blocks.length}`} className="mt-2 font-bold">
          {inline(h[2] ?? "", `h${blocks.length}`)}
        </p>,
      );
      continue;
    }
    const ul = /^\s*[-*•]\s+(.*)$/.exec(line);
    const ol = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    if (ul || ol) {
      flushPara();
      const ordered = !!ol;
      if (!list || list.ordered !== ordered) {
        flushList();
        list = { ordered, items: [] };
      }
      list.items.push((ul ?? ol)![1] ?? "");
      continue;
    }
    flushList();
    para.push(line);
  }
  if (code) blocks.push(<pre key="cend" className="overflow-x-auto rounded-md bg-muted p-3 text-xs"><code>{code.join("\n")}</code></pre>);
  flushPara();
  flushList();
  return <div className="space-y-2 text-sm">{blocks}</div>;
}
