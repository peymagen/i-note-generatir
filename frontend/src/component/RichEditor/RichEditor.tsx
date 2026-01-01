// import React, { useEffect, useState, useRef } from "react";
// import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css";
// import styles from "./RichEditor.module.css";
// import Button from "../Button/Button";
// import Input from "../Input/Input2";
// import { type Props } from "../../types/page";
// import { toast } from "react-toastify";
// import { useSelector } from "react-redux";
// import type { RootState } from "../../store/store";
// import {
//   useGetPageByIdQuery,
//   useCreatePageMutation,
//   useUpdatePageMutation,
// } from "../../store/services/page.api";
// import AuthLayout from "../Layout/Layout";



// const RichEditor: React.FC<Props> = ({
//   pageId,
//   inline = false,
//   initialData,
// }) => {
//   // console.log("Page initial", pageId);
//   console.log("initialData", initialData);

//   const { user } = useSelector((state: RootState) => state.auth);
//   const [page, setPage] = useState({ title: "", content: "" });
//   const quillRef = useRef<ReactQuill | null>(null);

//   const { data: pageData, isFetching } = useGetPageByIdQuery(pageId!, {
//     skip: !pageId || pageId.trim() === "",
//   });

//   const [createPage, { isLoading: isCreating }] = useCreatePageMutation();
//   const [updatePage, { isLoading: isUpdating }] = useUpdatePageMutation();

//   useEffect(() => {
//     if (pageData?.data) {
//       setPage({
//         title: pageData.data.title ?? "",
//         content: pageData.data.content ?? "",
//       });
//       console.log("Fetched Page:", pageData);
//     }
//   }, [pageData]);

//   useEffect(() => {
//   if (initialData) {
//     setPage(initialData);
//   }
// }, [initialData]);


//   const replaceVariables = (content: string): string => {
//     if (!user) return content;
//     return content
//       .replace(/\{\{name\}\}/g, (user as any).name || "")
//       .replace(/\{\{email\}\}/g, (user as any).email || "");
//   };

//   const handleSave = async () => {
//     if (!page.title.trim()) {
//       toast.error("Please enter a title");
//       return;
//     }

//     try {
//       const processedContent = replaceVariables(page.content);

//       if (pageId && pageId.trim() !== "") {
//         await updatePage({
//           id: pageId,
//           data: { title: page.title, content: processedContent },
//         }).unwrap();
//         toast.success("Page updated!");
//       } else {
//         const res = await createPage({
//           title: page.title,
//           content: processedContent,
//         }).unwrap();
//         console.log("Created:", res);
//         toast.success("Page created!");
//         setPage({
//           title: "",
//           content: "",
//         });
//         // navigate(-1)
//       }
//     } catch (err: any) {
//       toast.error(err?.message || "Save failed");
//     }
//   };

//   const insertVariable = (variable: string) => {
//     const editor = quillRef.current?.getEditor();
//     if (!editor) return;

//     const range = editor.getSelection();
//     const pos = range?.index ?? editor.getLength();
//     editor.insertText(pos, variable);
//     editor.setSelection(pos + variable.length, 0);
//   };

//   return (
//     <AuthLayout fullWidth>

      
//       <Input
//         fullWidth
//         label="Title"
//         name={"title" as any}
//         type="text"
//         value={page.title}
//         onChange={(e) => setPage({ ...page, title: e.target.value })}
//         placeholder="Enter title"
//         required={true}
//       />

//       {/* ✅ QUILL EDITOR */}
//       <div className={styles.editorLabel}>Content</div>

//       <ReactQuill
//         ref={quillRef}
//         theme="snow"
//         value={page.content}
//         onChange={(value) => setPage({ ...page, content: value })}
//         className={styles.quillEditor}
//         placeholder="Start writing..."
//       />

//       {/* ✅ VARIABLE TAGS */}
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

//       {/* ✅ SAVE BUTTON */}
//       <Button
//         label="Save"
//         onClick={handleSave}
//         loading={isFetching || isCreating || isUpdating}
//       />

//     </AuthLayout>
//   );
// };

// export default RichEditor;




import React, { useEffect, useState, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import styles from "./RichEditor.module.css";
import Button from "../Button/Button";
import Input from "../Input/Input2";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import {
  useGetPageByIdQuery,
  useCreatePageMutation,
  useUpdatePageMutation,
} from "../../store/services/page.api";

/* ================= PROPS ================= */

interface RichEditorProps {
  pageId?: string;
  inline?: boolean;
  initialData?: {
    title: string;
    content: string;
  };
}

/* ================= COMPONENT ================= */

const RichEditor: React.FC<RichEditorProps> = ({
  pageId,
  inline = false,
  initialData,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);

  const [page, setPage] = useState({
    title: "",
    content: "",
  });

  
  const [initialized, setInitialized] = useState(false);

  const quillRef = useRef<ReactQuill | null>(null);

  /* ================= BACKEND FETCH CONTROL ================= */

  const shouldFetch = !inline && !!pageId;

  const { data: pageData, isFetching } = useGetPageByIdQuery(pageId!, {
    skip: !shouldFetch,
    refetchOnMountOrArgChange: false,
  });

  const [createPage, { isLoading: isCreating }] = useCreatePageMutation();
  const [updatePage, { isLoading: isUpdating }] = useUpdatePageMutation();

  /* ================= INITIAL LOAD FROM BACKEND ================= */

  useEffect(() => {
    if (!shouldFetch) return;
    if (!pageData?.data) return;
    if (initialized) return;

    setPage({
      title: pageData.data.title ?? "",
      content: pageData.data.content ?? "",
    });
    console.log("pageData", pageData);

    setInitialized(true);
  }, [pageData, shouldFetch, initialized]);

  /* ================= INLINE MODE LOAD ================= */

  useEffect(() => {
    if (!inline || !initialData) return;

    setPage({
      title: initialData.title,
      content: initialData.content,
    });
    console.log("initialData", initialData);

    setInitialized(true);
  }, [initialData, inline]);

  /* ================= HELPERS ================= */

  const replaceVariables = (content: string): string => {
    if (!user) return content;
    return content
      .replace(/\{\{name\}\}/g, (user as any).name || "")
      .replace(/\{\{email\}\}/g, (user as any).email || "");
  };

  /* ================= SAVE ================= */

  const handleSave = async () => {
    if (!page.title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    try {
      const processedContent = replaceVariables(page.content);
      if (inline) {
        toast.success("Inspection content ready");
        return;
      }

      if (pageId) {
        await updatePage({
          id: pageId,
          data: { title: page.title, content: processedContent },
        }).unwrap();
        toast.success("Page updated!");
      } else {
        await createPage({
          title: page.title,
          content: processedContent,
        }).unwrap();
        toast.success("Page created!");
        setPage({ title: "", content: "" });
        setInitialized(false);
      }
    } catch (err: any) {
      toast.error(err?.message || "Save failed");
    }
  };

  /* ================= VARIABLE INSERT ================= */

  const insertVariable = (variable: string) => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;

    const range = editor.getSelection();
    const pos = range?.index ?? editor.getLength();
    editor.insertText(pos, variable);
    editor.setSelection(pos + variable.length, 0);
  };

  /* ================= UI ================= */

  return (
    <div className={inline ? styles.inlineWrapper : styles.pageWrapper}>
      <Input
        fullWidth
        label="Title"
        name={"title" as any}
        type="text"
        value={page.title}
        onChange={(e) => setPage({ ...page, title: e.target.value })}
        placeholder="Enter title"
        required
      />


      <div className={styles.editorLabel}>Content</div>

      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={page.content}
        onChange={(value) => setPage({ ...page, content: value })}
        className={styles.quillEditor}
        placeholder="Start writing..."
      />

      <div className={styles.variablesList}>
        {["{{name}}", "{{email}}"].map((v, i) => (
          <span
            key={i}
            onClick={() => insertVariable(v)}
            className={styles.variableTag}
          >
            {v.replace(/[{}]/g, "")}
          </span>
        ))}
      </div>

      <Button
        label={inline ? "Done" : "Save"}
        onClick={handleSave}
        loading={isFetching || isCreating || isUpdating}
      />
    </div>
  );
};

export default RichEditor;
