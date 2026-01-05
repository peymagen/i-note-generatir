import { useRef, useEffect } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import type { Editor } from "@ckeditor/ckeditor5-core";
import type {
  FieldValues,
  FieldErrors,
  FieldError,
  Merge,
  FieldErrorsImpl,
  UseFormWatch,
  UseFormSetValue,
  Path,
  PathValue,
} from "react-hook-form";
import type {
  FileRepository,
  FileLoader,
  UploadAdapter,
} from "@ckeditor/ckeditor5-upload";
import type { ViewDowncastWriter } from "@ckeditor/ckeditor5-engine";

import styles from "./RichEditor.module.css";
import { EditorWatchdog, ContextWatchdog } from "@ckeditor/ckeditor5-watchdog";
import type { Editor as CKEditorCore } from "@ckeditor/ckeditor5-core";

type EditorConstructor = {
  create(
    ...args: Parameters<typeof ClassicEditor.create>
  ): Promise<CKEditorCore>;
  EditorWatchdog: typeof EditorWatchdog;
  ContextWatchdog: typeof ContextWatchdog;
};

/* ================= PROPS ================= */

interface RichTextEditorProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  watch: UseFormWatch<T>;
  setValue: UseFormSetValue<T>;
  errors?: FieldErrors<T>;
  required?: boolean;
  onEditorReady?: (editor: Editor) => void;
}

/* ================= IMAGE UPLOAD ADAPTER ================= */

class MyUploadAdapter implements UploadAdapter {
  private loader: FileLoader;
  private xhr: XMLHttpRequest | null = null;

  constructor(loader: FileLoader) {
    this.loader = loader;
  }

  upload(): Promise<{ default: string }> {
    return this.loader.file.then((file) => {
      if (!file) {
        return Promise.reject("No file provided");
      }

      return new Promise((resolve, reject) => {
        const data = new FormData();
        data.append("file", file);

        this.xhr = new XMLHttpRequest();
        this.xhr.open(
          "POST",
          `${import.meta.env.VITE_BASE_URL}api/upload`,
          true
        );

        this.xhr.onload = () => {
          try {
            const res = JSON.parse(this.xhr!.responseText);
            resolve({ default: res.data.url });
          } catch {
            reject("Invalid upload response");
          }
        };

        this.xhr.onerror = () => reject("Image upload failed");
        this.xhr.send(data);
      });
    });
  }

  abort() {
    this.xhr?.abort();
  }
}

/* ================= UPLOAD PLUGIN ================= */

function CustomUploadPlugin(editor: Editor) {
  const repository = editor.plugins.get("FileRepository") as FileRepository;
  repository.createUploadAdapter = (loader: FileLoader) =>
    new MyUploadAdapter(loader);
}

/* ================= COMPONENT ================= */

const RichTextEditor = <T extends FieldValues>({
  label,
  name,
  watch,
  setValue,
  errors,
  required = false,
  onEditorReady,
}: RichTextEditorProps<T>) => {
  const editorRef = useRef<Editor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const value = watch(name) ?? "";

  const error = name
    .split(".")
    .reduce<unknown>(
      (acc, key) =>
        typeof acc === "object" && acc !== null
          ? (acc as Record<string, unknown>)[key]
          : undefined,
      errors ?? {}
    ) as
    | FieldError
    | Merge<FieldError, FieldErrorsImpl<FieldError>>
    | undefined;

  const ClassicEditorTyped = ClassicEditor as unknown as EditorConstructor;

  useEffect(() => {
    if (!containerRef.current) return;

    // Add styles for tables
    const styleId = "custom-table-styles";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .ck-content table {
          border-collapse: collapse;
          width: 100%;
          margin: 10px 0;
        }
        
        .ck-content table td,
        .ck-content table th {
          border: 1px solid #ddd;
          padding: 8px;
          position: relative;
        }
        
        .ck-content table th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        
        .custom-table-menu {
          position: fixed;
          background: white;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          padding: 4px 0;
          z-index: 999999;
          min-width: 200px;
        }
        
        .custom-table-menu-item {
          padding: 10px 16px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .custom-table-menu-item:hover {
          background: #f0f0f0;
        }
      `;
      document.head.appendChild(style);
    }

    // Setup context menu handler
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Check if we're inside the CKEditor content area
      const ckContent = target.closest(".ck-content");
      if (!ckContent) return;

      const cell = target.closest("td, th") as HTMLTableCellElement | null;
      const table = target.closest("table") as HTMLTableElement | null;

      if (cell || table) {
        e.preventDefault();
        e.stopPropagation();

        // Remove existing menu
        const existingMenu = document.querySelector(".custom-table-menu");
        if (existingMenu) {
          existingMenu.remove();
        }

        // Create menu
        const menu = document.createElement("div");
        menu.className = "custom-table-menu";
        menu.style.left = `${e.pageX}px`;
        menu.style.top = `${e.pageY}px`;

        const menuOptions = [
          {
            label: "Set Table Width",
            handler: () => {
              if (table) {
                const width = prompt(
                  "Enter table width (e.g., 100%, 600px):",
                  "100%"
                );
                if (width) {
                  table.style.width = width;
                  table.setAttribute("style", `width: ${width};`);
                }
              }
            },
          },
          {
            label: "Set Column Width",
            handler: () => {
              if (cell) {
                const width = prompt("Enter column width (px):", "150");
                if (width) {
                  const w = width.includes("px") ? width : `${width}px`;
                  cell.style.width = w;
                  cell.setAttribute("width", width.replace("px", ""));

                  // Apply to all cells in the column
                  const cellIndex = Array.from(
                    cell.parentElement!.children
                  ).indexOf(cell);
                  const rows = table?.querySelectorAll("tr");
                  rows?.forEach((row) => {
                    const targetCell = row.children[
                      cellIndex
                    ] as HTMLTableCellElement;
                    if (targetCell) {
                      targetCell.style.width = w;
                      targetCell.setAttribute("width", width.replace("px", ""));
                    }
                  });
                }
              }
            },
          },
          {
            label: "Set Cell Background",
            handler: () => {
              if (cell) {
                const color = prompt(
                  "Enter color (e.g., #f0f0f0, lightblue):",
                  ""
                );
                if (color) {
                  cell.style.backgroundColor = color;
                }
              }
            },
          },
          {
            label: "Set Cell Padding",
            handler: () => {
              if (cell) {
                const padding = prompt("Enter padding (px):", "8");
                if (padding) {
                  const p = padding.includes("px") ? padding : `${padding}px`;
                  cell.style.padding = p;
                }
              }
            },
          },
          {
            label: "Set Text Alignment",
            handler: () => {
              if (cell) {
                const align = prompt(
                  "Enter alignment (left, center, right, justify):",
                  "left"
                );
                if (
                  align &&
                  ["left", "center", "right", "justify"].includes(align)
                ) {
                  cell.style.textAlign = align;
                }
              }
            },
          },
          {
            label: "Set Cell Width & Height",
            handler: () => {
              if (cell) {
                const width = prompt("Enter cell width (px):", "");
                if (width) {
                  const w = width.includes("px") ? width : `${width}px`;
                  cell.style.width = w;
                  cell.setAttribute("width", width.replace("px", ""));
                }

                const height = prompt("Enter cell height (px):", "");
                if (height) {
                  const h = height.includes("px") ? height : `${height}px`;
                  cell.style.height = h;
                  cell.setAttribute("height", height.replace("px", ""));
                }
              }
            },
          },
        ];

        menuOptions.forEach((option) => {
          const item = document.createElement("div");
          item.className = "custom-table-menu-item";
          item.textContent = option.label;
          item.onclick = (evt: MouseEvent) => {
            evt.stopPropagation();
            option.handler();
            menu.remove();
          };
          menu.appendChild(item);
        });

        document.body.appendChild(menu);

        // Close menu on click outside
        const closeMenu = (evt: MouseEvent) => {
          if (!menu.contains(evt.target as Node)) {
            menu.remove();
            document.removeEventListener("click", closeMenu);
          }
        };

        setTimeout(() => {
          document.addEventListener("click", closeMenu);
        }, 100);
      }
    };

    // Add event listener
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  return (
    <div className={styles.formGroup} ref={containerRef}>
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>

      <div className={`${styles.input} ${error ? styles.inputError : ""}`}>
        <CKEditor
          editor={ClassicEditorTyped}
          data={value || ""}
          config={{
            extraPlugins: [CustomUploadPlugin],
            toolbar: [
              "heading",
              "|",
              "bold",
              "italic",
              "underline",
              "strikethrough",
              "code",
              "|",
              "alignment:left",
              "alignment:center",
              "alignment:right",
              "|",
              "link",
              "|",
              "bulletedList",
              "numberedList",
              "|",
              "uploadImage",
              "insertTable",
              "blockQuote",
              "|",
              "undo",
              "redo",
            ],

            table: {
              contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
            },
            alignment: {
              options: ["left", "center", "right"],
            },
          }}
          onReady={(editor) => {
            editorRef.current = editor;
            onEditorReady?.(editor);

            editor.editing.view.change((writer: ViewDowncastWriter) => {
              writer.setStyle(
                "min-height",
                "250px",
                editor.editing.view.document.getRoot()!
              );
            });
          }}
          onChange={(_, editor) => {
            const data = editor.getData();
            setValue(name, data as PathValue<T, typeof name>, {
              shouldDirty: true,
              shouldValidate: true,
            });
          }}
        />
      </div>

      {error && (
        <p className={styles.errorMessage}>
          {typeof error.message === "string"
            ? error.message
            : "Invalid content"}
        </p>
      )}
    </div>
  );
};

export default RichTextEditor;
