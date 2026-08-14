import {
  createContext,
  useContext,
  useMemo,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import { HolderOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type RowContextValue = {
  setActivatorNodeRef?: (element: HTMLElement | null) => void;
  listeners?: ReturnType<typeof useSortable>["listeners"];
};

const RowContext = createContext<RowContextValue>({});

export function DragHandle() {
  const { setActivatorNodeRef, listeners } = useContext(RowContext);
  return (
    <Button
      type="text"
      size="small"
      className="item-drag-handle"
      icon={<HolderOutlined />}
      aria-label="ลากเพื่อสลับตำแหน่ง"
      ref={setActivatorNodeRef}
      {...listeners}
    />
  );
}

type SortableItemRowProps = HTMLAttributes<HTMLTableRowElement> & {
  "data-row-key": string;
};

export function SortableItemRow(props: SortableItemRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props["data-row-key"] });

  const style: CSSProperties = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging
      ? { position: "relative", zIndex: 99, background: "#fff" }
      : {}),
  };

  const value = useMemo(
    () => ({ setActivatorNodeRef, listeners }),
    [setActivatorNodeRef, listeners],
  );

  return (
    <RowContext.Provider value={value}>
      <tr {...props} ref={setNodeRef} style={style} {...attributes} />
    </RowContext.Provider>
  );
}
