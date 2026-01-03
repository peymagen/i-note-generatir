// import React, { useEffect, useState, useRef } from "react";
// import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css";
// import styles from "./RichEditor.module.css";
// import Button from "../Button/Button";
// import Input from "../Input/Input2";
// import { toast } from "react-toastify";
// import { useSelector } from "react-redux";
// import type { RootState } from "../../store/store";
// import {
//   useGetPageByIdQuery,
//   useCreatePageMutation,
//   useUpdatePageMutation,
// } from "../../store/services/page.api";

// /* ================= PROPS ================= */

// interface RichEditorProps {
//   pageId?: string;
//   inline?: boolean;
//   initialData?: {
//     title: string;
//     content: string;
//   };
// }

// /* ================= COMPONENT ================= */

// const RichEditor: React.FC<RichEditorProps> = ({
//   pageId,
//   inline = false,
//   initialData,
// }) => {
//   const { user } = useSelector((state: RootState) => state.auth);

//   const [page, setPage] = useState({
//     title: "",
//     content: "",
//   });

  
//   const [initialized, setInitialized] = useState(false);

//   const quillRef = useRef<ReactQuill | null>(null);

//   /* ================= BACKEND FETCH CONTROL ================= */

//   const shouldFetch = !inline && !!pageId;

//   const { data: pageData, isFetching } = useGetPageByIdQuery(pageId!, {
//     skip: !shouldFetch,
//     refetchOnMountOrArgChange: false,
//   });

//   const [createPage, { isLoading: isCreating }] = useCreatePageMutation();
//   const [updatePage, { isLoading: isUpdating }] = useUpdatePageMutation();

//   /* ================= INITIAL LOAD FROM BACKEND ================= */

//   useEffect(() => {
//     if (!shouldFetch) return;
//     if (!pageData?.data) return;
//     if (initialized) return;

//     setPage({
//       title: pageData.data.title ?? "",
//       content: pageData.data.content ?? "",
//     });
//     console.log("pageData", pageData);

//     setInitialized(true);
//   }, [pageData, shouldFetch, initialized]);

//   /* ================= INLINE MODE LOAD ================= */

//   useEffect(() => {
//     if (!inline || !initialData) return;

//     setPage({
//       title: initialData.title,
//       content: initialData.content,
//     });
//     console.log("initialData", initialData);

//     setInitialized(true);
//   }, [initialData, inline]);

//   /* ================= HELPERS ================= */

//   const replaceVariables = (content: string): string => {
//     if (!user) return content;
//     return content
//       .replace(/\{\{name\}\}/g, (user as any).name || "")
//       .replace(/\{\{email\}\}/g, (user as any).email || "");
//   };

//   /* ================= SAVE ================= */

//   const handleSave = async () => {
//     if (!page.title.trim()) {
//       toast.error("Please enter a title");
//       return;
//     }

//     try {
//       const processedContent = replaceVariables(page.content);
//       if (inline) {
//         toast.success("Inspection content ready");
//         return;
//       }

//       if (pageId) {
//         await updatePage({
//           id: pageId,
//           data: { title: page.title, content: processedContent },
//         }).unwrap();
//         toast.success("Page updated!");
//       } else {
//         await createPage({
//           title: page.title,
//           content: processedContent,
//         }).unwrap();
//         toast.success("Page created!");
//         setPage({ title: "", content: "" });
//         setInitialized(false);
//       }
//     } catch (err: any) {
//       toast.error(err?.message || "Save failed");
//     }
//   };

//   /* ================= VARIABLE INSERT ================= */

//   const insertVariable = (variable: string) => {
//     const editor = quillRef.current?.getEditor();
//     if (!editor) return;

//     const range = editor.getSelection();
//     const pos = range?.index ?? editor.getLength();
//     editor.insertText(pos, variable);
//     editor.setSelection(pos + variable.length, 0);
//   };

//   /* ================= UI ================= */

//   return (
//     <div className={inline ? styles.inlineWrapper : styles.pageWrapper}>
//       <Input
//         fullWidth
//         label="Title"
//         name={"title" as any}
//         type="text"
//         value={page.title}
//         onChange={(e) => setPage({ ...page, title: e.target.value })}
//         placeholder="Enter title"
//         required
//       />


//       <div className={styles.editorLabel}>Content</div>

//       <ReactQuill
//         ref={quillRef}
//         theme="snow"
//         value={page.content}
//         onChange={(value) => setPage({ ...page, content: value })}
//         className={styles.quillEditor}
//         placeholder="Start writing..."
//       />

//       <div className={styles.variablesList}>
//         {["{{name}}", "{{email}}"].map((v, i) => (
//           <span
//             key={i}
//             onClick={() => insertVariable(v)}
//             className={styles.variableTag}
//           >
//             {v.replace(/[{}]/g, "")}
//           </span>
//         ))}
//       </div>

//       <Button
//         label={inline ? "Done" : "Save"}
//         onClick={handleSave}
//         loading={isFetching || isCreating || isUpdating}
//       />
//     </div>
//   );
// };

// export default RichEditor;




import { useEffect, useRef } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

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

import type { Editor } from "@ckeditor/ckeditor5-core";
import type { FileRepository, FileLoader, UploadAdapter } from "@ckeditor/ckeditor5-upload";
import type { ViewDowncastWriter } from "@ckeditor/ckeditor5-engine";


import styles from "./RichEditor.module.css";

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
          `${import.meta.env.VITE_BACKEND_SERVER}api/upload`,
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

/* ================= PROPS ================= */

interface RichTextEditorProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  errors?: FieldErrors<T>;
  setValue: UseFormSetValue<T>;
  watch: UseFormWatch<T>;
  required?: boolean;
}

/* ================= COMPONENT ================= */

const RichTextEditor = <T extends FieldValues>({
  label,
  name,
  errors,
  setValue,
  watch,
  required = false,
}: RichTextEditorProps<T>) => {
  const editorRef = useRef<Editor | null>(null);
  const initializedRef = useRef(false);

  const value = watch(name) ?? "";

  /* ================= ERROR HANDLING ================= */

  const getNestedError = (
    errorsObj: FieldErrors,
    path: string
  ): unknown =>
    path.split(".").reduce<unknown>(
      (acc, key) =>
        typeof acc === "object" && acc !== null
          ? (acc as Record<string, unknown>)[key]
          : undefined,
      errorsObj
    );

  const error = getNestedError(errors ?? {}, name) as
    | FieldError
    | Merge<FieldError, FieldErrorsImpl<FieldError>>
    | undefined;

  /* ================= INITIAL DATA LOAD ================= */

  useEffect(() => {
    if (!editorRef.current) return;
    if (initializedRef.current) return;
    if (!value) return;

    editorRef.current.setData(value);
    initializedRef.current = true;
  }, [value]);

  /* ================= UI ================= */

  return (
    <div className={styles.formGroup}>
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>

      <div className={`${styles.input} ${error ? styles.inputError : ""}`}>
        <CKEditor
          editor={ClassicEditor}
          config={{
            extraPlugins: [CustomUploadPlugin],
            toolbar: [
              "heading",
              "|",
              "bold",
              "italic",
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
              contentToolbar: [
                "tableColumn",
                "tableRow",
                "mergeTableCells",
                "tableProperties",
                "tableCellProperties",
              ],
            },
          }}
          onReady={(editor) => {
            editorRef.current = editor;

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
