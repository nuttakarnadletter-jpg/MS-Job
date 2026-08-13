import { useEffect, useRef, useState } from "react";
import {
  BoldOutlined,
  CodeOutlined,
  ItalicOutlined,
  LinkOutlined,
  OrderedListOutlined,
  PictureOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { Button, Input, Tooltip } from "antd";

function sanitizeHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object[\s\S]*?>[\s\S]*?<\/object>/gi, "")
    .replace(/<embed[\s\S]*?>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value.trim());
}

export function BodyEditor({
  value,
  onChange,
  placeholder = "เขียนเนื้อหาหน้ารายละเอียด หรือวาง HTML ได้",
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const areaRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"visual" | "html">("visual");
  const [htmlDraft, setHtmlDraft] = useState(value);

  useEffect(() => {
    if (areaRef.current) areaRef.current.innerHTML = value || "";
  }, []);

  const emitFromVisual = () => {
    const html = areaRef.current?.innerHTML ?? "";
    setHtmlDraft(html);
    onChange(html);
  };

  const applyHtml = (html: string) => {
    const clean = sanitizeHtml(html);
    setHtmlDraft(clean);
    if (areaRef.current) areaRef.current.innerHTML = clean;
    onChange(clean);
  };

  const switchMode = (next: "visual" | "html") => {
    if (next === "html") {
      const current = areaRef.current?.innerHTML ?? htmlDraft;
      setHtmlDraft(current);
      onChange(current);
    } else {
      applyHtml(htmlDraft);
    }
    setMode(next);
  };

  const run = (command: string, argument?: string) => {
    if (mode !== "visual") return;
    areaRef.current?.focus();
    document.execCommand(command, false, argument);
    emitFromVisual();
  };

  const insertLink = () => {
    const href = window.prompt("ใส่ลิงก์", "https://");
    if (!href?.trim()) return;
    run("createLink", href.trim());
  };

  const insertImage = () => {
    const src = window.prompt("ใส่ URL รูป", "https://");
    if (!src?.trim()) return;
    run("insertImage", src.trim());
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const html = event.clipboardData.getData("text/html").trim();
    const text = event.clipboardData.getData("text/plain");
    const incoming = html || text;
    if (!incoming) return;
    if (!html && !looksLikeHtml(text)) return;
    event.preventDefault();
    document.execCommand("insertHTML", false, sanitizeHtml(incoming));
    emitFromVisual();
  };

  return (
    <div className="body-editor">
      <div className="body-editor-toolbar" role="toolbar" aria-label="จัดรูปแบบเนื้อหา">
        <Tooltip title="หัวข้อ">
          <Button
            type="text"
            size="small"
            disabled={mode === "html"}
            onClick={() => run("formatBlock", "h2")}
          >
            H2
          </Button>
        </Tooltip>
        <Tooltip title="หัวข้อย่อย">
          <Button
            type="text"
            size="small"
            disabled={mode === "html"}
            onClick={() => run("formatBlock", "h3")}
          >
            H3
          </Button>
        </Tooltip>
        <Tooltip title="ย่อหน้า">
          <Button
            type="text"
            size="small"
            disabled={mode === "html"}
            onClick={() => run("formatBlock", "p")}
          >
            P
          </Button>
        </Tooltip>
        <span className="body-editor-sep" />
        <Tooltip title="ตัวหนา">
          <Button
            type="text"
            size="small"
            disabled={mode === "html"}
            icon={<BoldOutlined />}
            onClick={() => run("bold")}
          />
        </Tooltip>
        <Tooltip title="ตัวเอียง">
          <Button
            type="text"
            size="small"
            disabled={mode === "html"}
            icon={<ItalicOutlined />}
            onClick={() => run("italic")}
          />
        </Tooltip>
        <Tooltip title="รายการหัวข้อย่อย">
          <Button
            type="text"
            size="small"
            disabled={mode === "html"}
            icon={<UnorderedListOutlined />}
            onClick={() => run("insertUnorderedList")}
          />
        </Tooltip>
        <Tooltip title="รายการลำดับ">
          <Button
            type="text"
            size="small"
            disabled={mode === "html"}
            icon={<OrderedListOutlined />}
            onClick={() => run("insertOrderedList")}
          />
        </Tooltip>
        <Tooltip title="ลิงก์">
          <Button
            type="text"
            size="small"
            disabled={mode === "html"}
            icon={<LinkOutlined />}
            onClick={insertLink}
          />
        </Tooltip>
        <Tooltip title="แทรกรูปจาก URL">
          <Button
            type="text"
            size="small"
            disabled={mode === "html"}
            icon={<PictureOutlined />}
            onClick={insertImage}
          />
        </Tooltip>
        <div className="body-editor-mode">
          <Button
            size="small"
            type={mode === "visual" ? "primary" : "default"}
            onClick={() => switchMode("visual")}
          >
            เนื้อหา
          </Button>
          <Button
            size="small"
            type={mode === "html" ? "primary" : "default"}
            icon={<CodeOutlined />}
            onClick={() => switchMode("html")}
          >
            HTML
          </Button>
        </div>
      </div>
      {mode === "html" ? (
        <Input.TextArea
          className="body-editor-source"
          value={htmlDraft}
          placeholder={'วาง HTML ได้ เช่น <h2>หัวข้อ</h2><p>เนื้อหา</p>'}
          onChange={(event) => {
            const next = event.target.value;
            setHtmlDraft(next);
            onChange(sanitizeHtml(next));
          }}
        />
      ) : null}
      <div
        ref={areaRef}
        className={`body-editor-area${mode === "html" ? " is-hidden" : ""}`}
        contentEditable={mode === "visual"}
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        onInput={emitFromVisual}
        onBlur={emitFromVisual}
        onPaste={handlePaste}
      />
    </div>
  );
}
