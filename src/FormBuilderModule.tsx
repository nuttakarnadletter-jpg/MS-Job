import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  AlignLeftOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  CheckSquareOutlined,
  CloseOutlined,
  CalendarOutlined,
  DeleteOutlined,
  DownSquareOutlined,
  EyeOutlined,
  FontSizeOutlined,
  FormOutlined,
  HolderOutlined,
  LockOutlined,
  MailOutlined,
  NumberOutlined,
  PhoneOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  Empty,
  Flex,
  Form,
  Input,
  Modal,
  Popconfirm,
  Radio,
  Segmented,
  Select,
  Space,
  Switch,
  Typography,
} from "antd";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "./form-builder.css";

type Lang = "th" | "en" | "cn";
type FieldType =
  | "header"
  | "paragraph"
  | "fullName"
  | "email"
  | "phone"
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "upload"
  | "select"
  | "radio"
  | "checkbox"
  | "consent"
  | "privacy";
type FieldGroup = "content" | "contact" | "input" | "choices" | "legal";
type ActiveId = "header" | string | null;

type LangText = Record<Lang, string>;

type FormField = {
  id: string;
  type: FieldType;
  required: boolean;
  label: LangText;
  placeholder?: LangText;
  options?: LangText[];
};

const LANG_OPTIONS = [
  { label: "TH", value: "th" },
  { label: "EN", value: "en" },
  { label: "CN", value: "cn" },
];

const FIELD_TYPES: {
  type: FieldType;
  label: string;
  group: FieldGroup;
  icon: ReactNode;
}[] = [
  { type: "header", label: "หัวข้อ (Header)", group: "content", icon: <FontSizeOutlined /> },
  { type: "paragraph", label: "ย่อหน้า (Paragraph)", group: "content", icon: <AlignLeftOutlined /> },
  { type: "fullName", label: "ชื่อ-นามสกุล (Full Name)", group: "contact", icon: <UserOutlined /> },
  { type: "email", label: "อีเมล (Email)", group: "contact", icon: <MailOutlined /> },
  { type: "phone", label: "เบอร์โทรศัพท์ (Phone)", group: "contact", icon: <PhoneOutlined /> },
  { type: "text", label: "ข้อความสั้น (Text)", group: "input", icon: <FontSizeOutlined /> },
  { type: "number", label: "ตัวเลข (Number)", group: "input", icon: <NumberOutlined /> },
  { type: "textarea", label: "ข้อความยาว (Textarea)", group: "input", icon: <AlignLeftOutlined /> },
  { type: "date", label: "วันที่ (Date)", group: "input", icon: <CalendarOutlined /> },
  { type: "upload", label: "แนบไฟล์ (Upload)", group: "input", icon: <UploadOutlined /> },
  { type: "select", label: "ตัวเลือก Dropdown", group: "choices", icon: <DownSquareOutlined /> },
  { type: "radio", label: "ตัวเลือกเดียว (Radio)", group: "choices", icon: <CheckCircleOutlined /> },
  { type: "checkbox", label: "หลายตัวเลือก (Checkbox)", group: "choices", icon: <CheckSquareOutlined /> },
  { type: "consent", label: "ยินยอม (Consent)", group: "legal", icon: <SafetyCertificateOutlined /> },
  { type: "privacy", label: "นโยบายความเป็นส่วนตัว (Privacy)", group: "legal", icon: <LockOutlined /> },
];

const FIELD_GROUPS: { key: FieldGroup; label: string }[] = [
  { key: "content", label: "เนื้อหา (Content)" },
  { key: "contact", label: "ข้อมูลติดต่อ (Contact)" },
  { key: "input", label: "ข้อมูลทั่วไป (Input)" },
  { key: "choices", label: "ตัวเลือก (Choices)" },
  { key: "legal", label: "ข้อกำหนด (Legal)" },
];

const INITIAL_META: Record<"title" | "desc", LangText> = {
  title: {
    th: "แบบฟอร์มลงทะเบียน",
    en: "Registration Form",
    cn: "注册表单",
  },
  desc: {
    th: "กรุณากรอกข้อมูลให้ครบถ้วน",
    en: "Please fill out all required fields",
    cn: "请填写所有必填项",
  },
};

const INITIAL_FIELDS: FormField[] = [
  {
    id: "field-1",
    type: "text",
    required: true,
    label: { th: "ชื่อ-นามสกุล", en: "Full Name", cn: "全名" },
    placeholder: { th: "กรอกชื่อ-นามสกุล", en: "Enter your name", cn: "请输入您的姓名" },
  },
  {
    id: "field-2",
    type: "radio",
    required: false,
    label: { th: "เพศ", en: "Gender", cn: "性别" },
    options: [
      { th: "ชาย", en: "Male", cn: "男" },
      { th: "หญิง", en: "Female", cn: "女" },
    ],
  },
];

function langValue(value: Partial<LangText> | undefined, lang: Lang) {
  return value?.[lang] || value?.th || "";
}

function blankLangText(th = "", en = "", cn = ""): LangText {
  return { th, en, cn };
}

function defaultFieldCopy(type: FieldType): Pick<FormField, "label" | "placeholder" | "options"> {
  switch (type) {
    case "header":
      return { label: blankLangText("หัวข้อฟอร์ม", "Form Header", "表单标题") };
    case "paragraph":
      return {
        label: blankLangText(
          "ข้อความอธิบายเพิ่มเติมสำหรับผู้กรอกฟอร์ม",
          "Additional helper text for respondents",
          "给填写者的补充说明",
        ),
      };
    case "fullName":
      return {
        label: blankLangText("ชื่อ-นามสกุล", "Full Name", "全名"),
        placeholder: blankLangText("กรอกชื่อ-นามสกุล", "Enter full name", "请输入全名"),
      };
    case "email":
      return {
        label: blankLangText("อีเมล", "Email", "电子邮件"),
        placeholder: blankLangText("name@example.com", "name@example.com", "name@example.com"),
      };
    case "phone":
      return {
        label: blankLangText("เบอร์โทรศัพท์", "Phone Number", "电话号码"),
        placeholder: blankLangText("กรอกเบอร์โทรศัพท์", "Enter phone number", "请输入电话号码"),
      };
    case "text":
      return {
        label: blankLangText("ข้อความสั้น", "Text", "短文本"),
        placeholder: blankLangText("กรอกข้อความ", "Enter text", "请输入文本"),
      };
    case "textarea":
      return {
        label: blankLangText("ข้อความยาว", "Textarea", "长文本"),
        placeholder: blankLangText("กรอกรายละเอียด", "Enter details", "请输入详细信息"),
      };
    case "number":
      return {
        label: blankLangText("ตัวเลข", "Number", "数字"),
        placeholder: blankLangText("กรอกตัวเลข", "Enter number", "请输入数字"),
      };
    case "date":
      return {
        label: blankLangText("วันที่", "Date", "日期"),
        placeholder: blankLangText("เลือกวันที่", "Select date", "选择日期"),
      };
    case "upload":
      return {
        label: blankLangText("แนบไฟล์", "Upload File", "上传文件"),
        placeholder: blankLangText("คลิกเพื่ออัปโหลดไฟล์", "Click to upload file", "点击上传文件"),
      };
    case "select":
      return {
        label: blankLangText("ตัวเลือก Dropdown", "Dropdown", "下拉选项"),
        options: [blankLangText("ตัวเลือก 1", "Option 1", "选项 1")],
      };
    case "radio":
      return {
        label: blankLangText("ตัวเลือกเดียว", "Radio", "单选"),
        options: [blankLangText("ตัวเลือก 1", "Option 1", "选项 1")],
      };
    case "checkbox":
      return {
        label: blankLangText("หลายตัวเลือก", "Checkbox", "多选"),
        options: [blankLangText("ตัวเลือก 1", "Option 1", "选项 1")],
      };
    case "consent":
      return {
        label: blankLangText(
          "ข้าพเจ้ายินยอมให้ติดต่อกลับตามข้อมูลที่ให้ไว้",
          "I consent to be contacted using the information provided",
          "我同意根据所提供的信息与我联系",
        ),
      };
    case "privacy":
      return {
        label: blankLangText(
          "ข้าพเจ้ายอมรับนโยบายความเป็นส่วนตัว",
          "I accept the privacy policy",
          "我接受隐私政策",
        ),
      };
  }
}

function createField(type: FieldType): FormField {
  const copy = defaultFieldCopy(type);
  const field: FormField = {
    id: `field-${Date.now()}`,
    type,
    required: type === "consent" || type === "privacy",
    label: copy.label,
    placeholder: copy.placeholder,
    options: copy.options,
  };
  return field;
}

function FormFieldBody({ field, previewLang }: { field: FormField; previewLang: Lang }) {
  const placeholder = langValue(field.placeholder, previewLang);
  const options = field.options ?? [];
  const label = langValue(field.label, previewLang) || "ไม่มีชื่อหัวข้อ";

  if (field.type === "header") {
    return (
      <Typography.Title level={4} className="form-content-header">
        {label}
      </Typography.Title>
    );
  }
  if (field.type === "paragraph") {
    return <Typography.Paragraph className="form-content-paragraph">{label}</Typography.Paragraph>;
  }
  if (field.type === "fullName" || field.type === "email" || field.type === "phone") {
    const inputType = field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text";
    return <Input disabled type={inputType} placeholder={placeholder} />;
  }
  if (field.type === "text" || field.type === "number") {
    return <Input disabled type={field.type} placeholder={placeholder} />;
  }
  if (field.type === "date") {
    return <Input disabled prefix={<CalendarOutlined />} placeholder={placeholder} />;
  }
  if (field.type === "textarea") {
    return <Input.TextArea disabled rows={2} placeholder={placeholder} />;
  }
  if (field.type === "upload") {
    return (
      <div className="form-image-upload-preview">
        <UploadOutlined />
        <span>{placeholder || "คลิกเพื่ออัปโหลดไฟล์"}</span>
        <Typography.Text type="secondary">PDF, DOCX, JPG, PNG</Typography.Text>
      </div>
    );
  }
  if (field.type === "select") {
    return (
      <Select
        disabled
        placeholder="-- โปรดเลือก / Select --"
        options={options.map((option, index) => ({
          value: index,
          label: langValue(option, previewLang),
        }))}
        style={{ width: "100%" }}
      />
    );
  }
  if (field.type === "radio") {
    return (
      <Radio.Group disabled>
        <Space direction="vertical">
          {options.map((option, index) => (
            <Radio key={index} value={index}>
              {langValue(option, previewLang)}
            </Radio>
          ))}
        </Space>
      </Radio.Group>
    );
  }
  if (field.type === "checkbox") {
    return (
      <Space direction="vertical">
        {options.map((option, index) => (
          <Checkbox key={index} disabled>
            {langValue(option, previewLang)}
          </Checkbox>
        ))}
      </Space>
    );
  }
  return <Checkbox disabled>{label}</Checkbox>;
}

function FieldPreview({
  field,
  active,
  previewLang,
  showDragHandle,
  onSelect,
}: {
  field: FormField;
  active: boolean;
  previewLang: Lang;
  showDragHandle: boolean;
  onSelect: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: field.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : 1,
  };
  const label = langValue(field.label, previewLang) || "ไม่มีชื่อหัวข้อ";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`form-field-preview${active ? " active" : ""}`}
      onClick={() => onSelect(field.id)}
    >
      {showDragHandle ? (
        <button
          className="form-drag-handle"
          type="button"
          aria-label="Drag field"
          {...attributes}
          {...listeners}
        >
          <HolderOutlined />
        </button>
      ) : null}
      {field.type !== "header" && field.type !== "paragraph" && field.type !== "consent" && field.type !== "privacy" ? (
        <Flex gap={4} align="center" className="form-field-label">
          <span>{label}</span>
          {field.required ? <span className="form-required">*</span> : null}
        </Flex>
      ) : null}
      <FormFieldBody field={field} previewLang={previewLang} />
    </div>
  );
}

export function FormBuilderModule() {
  const [previewLang, setPreviewLang] = useState<Lang>("th");
  const [formMeta, setFormMeta] = useState(INITIAL_META);
  const [fields, setFields] = useState<FormField[]>(INITIAL_FIELDS);
  const [activeId, setActiveId] = useState<ActiveId>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [panel, setPanel] = useState<"toolbox" | "settings">("toolbox");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [toolboxPulse, setToolboxPulse] = useState(false);
  const toolboxPulseTimer = useRef<number | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  useEffect(() => {
    return () => {
      if (toolboxPulseTimer.current) {
        window.clearTimeout(toolboxPulseTimer.current);
      }
    };
  }, []);

  const activeField = useMemo(
    () => fields.find((field) => field.id === activeId),
    [activeId, fields],
  );
  const activeIndex = fields.findIndex((field) => field.id === activeId);

  const selectTarget = (id: ActiveId) => {
    setActiveId(id);
    setPanel("settings");
    setSidebarOpen(true);
  };

  const revealBuilderTop = () => {
    window.setTimeout(() => {
      document
        .querySelector(".form-builder-module")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const pulseToolboxPanel = () => {
    if (toolboxPulseTimer.current) {
      window.clearTimeout(toolboxPulseTimer.current);
    }
    setToolboxPulse(false);
    window.requestAnimationFrame(() => {
      setToolboxPulse(true);
      toolboxPulseTimer.current = window.setTimeout(() => {
        setToolboxPulse(false);
      }, 1100);
    });
  };

  const openToolboxFromCanvas = () => {
    setSidebarOpen(true);
    setPanel("toolbox");
    setActiveId(null);
    revealBuilderTop();
    pulseToolboxPanel();
  };

  const addField = (type: FieldType) => {
    const field = createField(type);
    setFields((current) => [...current, field]);
    selectTarget(field.id);
  };

  const patchField = (id: string, patch: Partial<FormField>) => {
    setFields((current) =>
      current.map((field) => (field.id === id ? { ...field, ...patch } : field)),
    );
  };

  const patchFieldLang = (
    id: string,
    key: "label" | "placeholder",
    lang: Lang,
    value: string,
  ) => {
    setFields((current) =>
      current.map((field) =>
        field.id === id
          ? {
              ...field,
              [key]: {
                ...(field[key] ?? blankLangText()),
                [lang]: value,
              },
            }
          : field,
      ),
    );
  };

  const patchOption = (fieldId: string, optionIndex: number, lang: Lang, value: string) => {
    setFields((current) =>
      current.map((field) => {
        if (field.id !== fieldId) return field;
        return {
          ...field,
          options: (field.options ?? []).map((option, index) =>
            index === optionIndex ? { ...option, [lang]: value } : option,
          ),
        };
      }),
    );
  };

  const addOption = (fieldId: string) => {
    setFields((current) =>
      current.map((field) =>
        field.id === fieldId
          ? {
              ...field,
              options: [
                ...(field.options ?? []),
                blankLangText("ตัวเลือกใหม่", "New Option", "新选项"),
              ],
            }
          : field,
      ),
    );
  };

  const removeOption = (fieldId: string, optionIndex: number) => {
    setFields((current) =>
      current.map((field) =>
        field.id === fieldId
          ? {
              ...field,
              options: (field.options ?? []).filter((_, index) => index !== optionIndex),
            }
          : field,
      ),
    );
  };

  const moveActive = (direction: -1 | 1) => {
    if (activeId === "header" || activeIndex < 0) return;
    const nextIndex = activeIndex + direction;
    if (nextIndex < 0 || nextIndex >= fields.length) return;
    setFields((current) => arrayMove(current, activeIndex, nextIndex));
  };

  const navigateActive = (direction: -1 | 1) => {
    if (activeId === "header") {
      if (direction === 1 && fields[0]) setActiveId(fields[0].id);
      return;
    }
    if (activeIndex < 0) return;
    if (direction === -1) setActiveId(activeIndex === 0 ? "header" : fields[activeIndex - 1].id);
    if (direction === 1 && fields[activeIndex + 1]) setActiveId(fields[activeIndex + 1].id);
  };

  const deleteActiveField = () => {
    if (!activeField) return;
    setFields((current) => current.filter((field) => field.id !== activeField.id));
    setActiveId(null);
    setPanel("toolbox");
  };

  const reorderFields = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    setFields((current) => {
      const from = current.findIndex((field) => field.id === active.id);
      const to = current.findIndex((field) => field.id === over.id);
      if (from < 0 || to < 0) return current;
      return arrayMove(current, from, to);
    });
  };

  const patchMeta = (key: "title" | "desc", lang: Lang, value: string) => {
    setFormMeta((current) => ({
      ...current,
      [key]: { ...current[key], [lang]: value },
    }));
  };

  const renderLanguageInputs = (
    label: string,
    value: LangText,
    onChange: (lang: Lang, next: string) => void,
    textarea = false,
  ) => (
    <Form.Item label={label}>
      <Space direction="vertical" size={10} style={{ width: "100%" }}>
        {(["th", "en", "cn"] as Lang[]).map((lang) => (
          <div key={lang} className="form-lang-input">
            <span>{lang.toUpperCase()}</span>
            {textarea ? (
              <Input.TextArea
                rows={2}
                value={value[lang]}
                onChange={(event) => onChange(lang, event.target.value)}
              />
            ) : (
              <Input
                value={value[lang]}
                onChange={(event) => onChange(lang, event.target.value)}
              />
            )}
          </div>
        ))}
      </Space>
    </Form.Item>
  );

  const renderSettings = () => {
    if (activeId === "header") {
      return (
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Card
            className="form-settings-section form-settings-section-main"
            size="small"
            title={<Space><FormOutlined />ตั้งค่าหัวข้อฟอร์ม</Space>}
          >
            {renderLanguageInputs("ชื่อฟอร์ม (Form Title)", formMeta.title, (lang, value) =>
              patchMeta("title", lang, value),
            )}
            {renderLanguageInputs("คำอธิบาย (Description)", formMeta.desc, (lang, value) =>
              patchMeta("desc", lang, value),
            true)}
          </Card>
        </Space>
      );
    }

    if (!activeField) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="คลิกที่หัวข้อหรือฟิลด์ตรงกลางเพื่อตั้งค่า"
        />
      );
    }

    const canToggleRequired = activeField.type !== "header" && activeField.type !== "paragraph";
    const canHavePlaceholder = [
      "fullName",
      "email",
      "phone",
      "text",
      "textarea",
      "number",
      "date",
      "upload",
    ].includes(activeField.type);
    const canHaveOptions = ["select", "radio", "checkbox"].includes(activeField.type);

    return (
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        {canToggleRequired ? (
          <Card className="form-settings-section form-settings-section-required" size="small">
            <Flex align="center" justify="space-between">
              <Typography.Text strong>จำเป็นต้องกรอก (Required)</Typography.Text>
              <Switch
                checked={activeField.required}
                onChange={(required) => patchField(activeField.id, { required })}
              />
            </Flex>
          </Card>
        ) : null}

        <Card className="form-settings-section form-settings-section-main" size="small">
          {renderLanguageInputs("ชื่อหัวข้อ (Label)", activeField.label, (lang, value) =>
            patchFieldLang(activeField.id, "label", lang, value),
          )}
          {canHavePlaceholder
            ? renderLanguageInputs(
                "คำแนะนำ (Placeholder)",
                activeField.placeholder ?? blankLangText(),
                (lang, value) => patchFieldLang(activeField.id, "placeholder", lang, value),
              )
            : null}
        </Card>

        {canHaveOptions ? (
          <Card
            className="form-settings-section form-settings-section-options"
            size="small"
            title="ตัวเลือก (Options)"
            extra={
              <Button
                type="link"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => addOption(activeField.id)}
              >
                เพิ่ม
              </Button>
            }
          >
            <Space direction="vertical" size={10} style={{ width: "100%" }}>
              {(activeField.options ?? []).map((option, optionIndex) => (
                <div className="form-option-editor" key={optionIndex}>
                  <Popconfirm
                    title="ลบตัวเลือกนี้?"
                    description="ตัวเลือกนี้จะถูกลบออกจากฟิลด์"
                    okText="ลบ"
                    cancelText="ยกเลิก"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => removeOption(activeField.id, optionIndex)}
                  >
                    <Button
                      className="form-option-remove"
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      aria-label="Remove option"
                    />
                  </Popconfirm>
                  {(["th", "en", "cn"] as Lang[]).map((lang) => (
                    <div key={lang} className="form-lang-input">
                      <span>{lang.toUpperCase()}</span>
                      <Input
                        value={option[lang]}
                        onChange={(event) =>
                          patchOption(activeField.id, optionIndex, lang, event.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
              ))}
            </Space>
          </Card>
        ) : null}
      </Space>
    );
  };

  return (
    <>
    <div className="form-builder-module">
      <div className="form-builder-main">
        <Flex className="form-builder-header" align="center" justify="space-between" wrap gap={12}>
          <div className="form-builder-title">
            <Typography.Title level={4} style={{ margin: 0 }}>
              แก้ไขฟอร์ม
            </Typography.Title>
          </div>
          <Space className="form-builder-actions" wrap>
            <Segmented
              size="small"
              value={previewLang}
              options={LANG_OPTIONS}
              onChange={(value) => setPreviewLang(value as Lang)}
            />
            <Button icon={<EyeOutlined />} onClick={() => setPreviewOpen(true)}>
              Preview
            </Button>
            <Button
              icon={<SettingOutlined />}
              onClick={() => {
                setActiveId("header");
                setPanel("settings");
                setSidebarOpen(true);
                revealBuilderTop();
              }}
            >
              ตั้งค่าฟอร์ม
            </Button>
          </Space>
        </Flex>

        <div className="form-builder-scroll">
          <div className="form-canvas">
            <button
              className={`form-header-box${
                activeId === "header" && sidebarOpen && panel === "settings" ? " active" : ""
              }`}
              type="button"
              onClick={() => selectTarget("header")}
            >
              <span className="form-edit-hint">คลิกเพื่อแก้ไข</span>
              <Typography.Title level={3} style={{ margin: 0 }}>
                {langValue(formMeta.title, previewLang) || "ไม่มีหัวข้อ"}
              </Typography.Title>
              <Typography.Text type="secondary">
                {langValue(formMeta.desc, previewLang)}
              </Typography.Text>
            </button>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={reorderFields}
            >
              <SortableContext
                items={fields.map((field) => field.id)}
                strategy={verticalListSortingStrategy}
              >
                <Space direction="vertical" size={4} style={{ width: "100%" }}>
                  {fields.map((field) => (
                    <FieldPreview
                      key={field.id}
                      field={field}
                      active={activeId === field.id && sidebarOpen && panel === "settings"}
                      previewLang={previewLang}
                      showDragHandle={panel === "toolbox"}
                      onSelect={selectTarget}
                    />
                  ))}
                </Space>
              </SortableContext>
            </DndContext>

            <button
              className="form-add-field"
              type="button"
              onClick={openToolboxFromCanvas}
            >
              <PlusOutlined />
              <span>คลิกเพื่อเพิ่มฟิลด์ (Add Field)</span>
            </button>
          </div>
        </div>
      </div>

      <aside className={`form-builder-side${sidebarOpen ? "" : " form-builder-side-collapsed"}`}>
        <div className="form-side-tabs">
          <Button
            type={panel === "toolbox" ? "primary" : "text"}
            block
            onClick={() => {
              setPanel("toolbox");
              setActiveId(null);
            }}
          >
            เพิ่มฟิลด์
          </Button>
          <Button
            type={panel === "settings" ? "primary" : "text"}
            block
            onClick={() => setPanel("settings")}
          >
            ตั้งค่า
          </Button>
          <Button
            type="text"
            icon={<CloseOutlined />}
            aria-label="Close settings"
            onClick={() => setSidebarOpen(false)}
          />
        </div>

        <div className="form-side-body">
          {panel === "toolbox" ? (
            <div
              className={`form-toolbox-panel${toolboxPulse ? " form-toolbox-panel-pulse" : ""}`}
            >
              {FIELD_GROUPS.map((group) => (
                <div className="form-toolbox-group" key={group.key}>
                  <Typography.Text type="secondary" className="form-toolbox-label">
                    {group.label}
                  </Typography.Text>
                  <Space direction="vertical" size={6} style={{ width: "100%", marginTop: 6 }}>
                    {FIELD_TYPES.filter((item) => item.group === group.key).map((item) => (
                      <Button
                        key={item.type}
                        className="form-toolbox-button"
                        icon={item.icon}
                        onClick={() => addField(item.type)}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </Space>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="form-side-settings">{renderSettings()}</div>
              <div className="form-side-actions">
                <Space>
                  <Button
                    icon={<ArrowUpOutlined />}
                    disabled={activeId === "header" || activeId === null}
                    onClick={() => navigateActive(-1)}
                  />
                  <Button
                    icon={<ArrowDownOutlined />}
                    disabled={
                      activeId === null ||
                      (activeId !== "header" && activeIndex === fields.length - 1)
                    }
                    onClick={() => navigateActive(1)}
                  />
                  <Button
                    icon={<HolderOutlined />}
                    disabled={!activeField || activeIndex === 0}
                    onClick={() => moveActive(-1)}
                  />
                  <Button
                    icon={<HolderOutlined />}
                    disabled={!activeField || activeIndex === fields.length - 1}
                    onClick={() => moveActive(1)}
                  />
                </Space>
                {activeField ? (
                  <Popconfirm
                    title="ลบฟิลด์นี้?"
                    description="ฟิลด์นี้และค่าที่ตั้งไว้จะถูกลบออกจากแบบฟอร์ม"
                    okText="ลบ"
                    cancelText="ยกเลิก"
                    okButtonProps={{ danger: true }}
                    onConfirm={deleteActiveField}
                  >
                    <Button danger icon={<DeleteOutlined />}>
                      ลบฟิลด์
                    </Button>
                  </Popconfirm>
                ) : null}
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
    <Modal
      title="Preview Form"
      open={previewOpen}
      onCancel={() => setPreviewOpen(false)}
      width={720}
      footer={[
        <Button key="close" onClick={() => setPreviewOpen(false)}>
          Close
        </Button>,
      ]}
    >
      <div className="form-preview-modal-body">
        <div className="form-public-header">
          <Typography.Title level={3} style={{ margin: 0 }}>
            {langValue(formMeta.title, previewLang) || "ไม่มีหัวข้อ"}
          </Typography.Title>
          <Typography.Text type="secondary">
            {langValue(formMeta.desc, previewLang)}
          </Typography.Text>
        </div>
        <Space direction="vertical" size={10} style={{ width: "100%" }}>
          {fields.map((field) => {
            const label = langValue(field.label, previewLang) || "ไม่มีชื่อหัวข้อ";
            return (
              <div className="form-public-field" key={field.id}>
                {field.type !== "header" &&
                field.type !== "paragraph" &&
                field.type !== "consent" &&
                field.type !== "privacy" ? (
                  <Flex gap={4} align="center" className="form-field-label">
                    <span>{label}</span>
                    {field.required ? <span className="form-required">*</span> : null}
                  </Flex>
                ) : null}
                <FormFieldBody field={field} previewLang={previewLang} />
              </div>
            );
          })}
        </Space>
      </div>
    </Modal>
    </>
  );
}
