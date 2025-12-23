// import React, { useEffect, useState, useRef } from "react";
// import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css";
// import styles from "./RichEditor.module.css";
// import Button from "../Button/Button";
// import { type Page ,type Props} from "../../types/page";
// import { toast } from "react-toastify";
// import { useDispatch, useSelector } from "react-redux";
// import type { RootState, AppDispatch } from "../../store/store";
// import {
//   useGetPageByIdQuery,
//   useCreatePageMutation,
//   useUpdatePageMutation,
// } from "../../store/services/page.api";
// import AuthLayout from "../Auth/Auth";

// const RichEditor: React.FC<Props> = ({ pageId = " "}) => {
//   console.log("page initial", pageId)
//   const dispatch = useDispatch<AppDispatch>();
//   const { user } = useSelector((state: RootState) => state.auth); 

//   const [page, setPage] = useState({ title: "", content: "" });
//   const quillRef = useRef<ReactQuill>(null);


//   const { data: pageData, isFetching } = useGetPageByIdQuery(pageId, {
//     skip: !pageId,
//   });


//   const [createPage, { isLoading: createLoading }] = useCreatePageMutation();
//   const [updatePage, { isLoading: updateLoading }] = useUpdatePageMutation();

//   useEffect(() => {
//     if (pageData?.data) {
//       setPage({
//         title: pageData.data.title,
//         content: pageData.data.content,
//       });
//       console.log(pageData)
//     }
//   }, [pageData]);

  // const replaceVariables = (content: string): string => {
  //   if (!user) return content;
  //   return content
  //     .replace(/\{\{name\}\}/g, (user as any).name || "")
  //     .replace(/\{\{email\}\}/g, (user as any).email || "");
  // };

//   // const handleSave = async () => {
//   //   if (!page.title.trim()) {
//   //     toast.error("Please enter a title");
//   //     return;
//   //   }

//   //   try {
//   //     const processedContent = replaceVariables(page.content);

//   //     if (pageId) {
//   //       console.log("page" ,pageId)
//   //       await updatePage({
//   //         id: pageId,
//   //         data: { title: page.title, content: processedContent },
//   //       }).unwrap(); 
//   //       toast.success("Page updated successfully");
//   //     } else {
//   //       console.log("Hit create page")
//   //       const res = await createPage({
//   //         title: page.title,
//   //         content: processedContent,
//   //       }).unwrap();
//   //       console.log(res)
//   //       toast.success("Page created successfully");
//   //     }
//   //   } catch (err: any) {
//   //     console.error("Save error", err);
//   //     toast.error(err?.message || "Error saving page");
//   //   }
//   // };

//   const handleSave = async () => {
//     try {
//       const processedContent = replaceVariables(page.content);

//       if (pageId && pageId !== " ") {
//         // Update existing page
//         console.log("Updating page", pageId);
//         await updatePage({
//           id: pageId,
//           data: { title: page.title, content: processedContent },
//         }).unwrap();
//         toast.success("Page updated successfully");
//       } else {
//         // Create new page  
//         console.log("Creating new page");
//         const res = await createPage({
//           title: page.title,
//           content: processedContent,
//         }).unwrap();
//         console.log("Page created:", res);
//         toast.success("Page created successfully");
//         // Optionally redirect or update the UI
//       }
//     } catch (err) {
//       console.error("Save error", err);
//       toast.error("Failed to save page");
//     }
//   };


//   const insertVariable = (variable: string) => {
//     const quill = (quillRef.current as any)?.getEditor();
//     if (quill) {
//       const range = quill.getSelection();
//       quill.insertText(range?.index || 0, variable);
//     }
//   };

//   const loading = isFetching || createLoading || updateLoading;

//   if (pageId && pageId !== " "){
//     subtitle = Edit 

//   }
//   else{
//     subtitle = New template
//   }

//   return (
    
//     <AuthLayout title="" subtitle={subtitle} fullWidth >
//       <input
//         type="text"
//         placeholder="Page title"
//         value={page.title}
//         onChange={(e) => setPage({ ...page, title: e.target.value })}
//         className={styles.titleInput}
//       />

//       <ReactQuill
//         ref={quillRef}
//         theme="snow"
//         value={page.content}
//         onChange={(value) => setPage((prev) => ({ ...prev, content: value }))}
//         className={styles.quillEditor}
//         placeholder="Start writing your content here..."
//       />

//       <div className={styles.variablesList}>
//         {["{{name}}", "{{email}}"].map((v, i) => (
//           <span key={i} className={styles.variableTag} onClick={() => insertVariable(v)}>
//             {v.replace(/[{}]/g, "")}
//           </span>
//         ))}
//       </div>

//       <Button label="Save" onClick={handleSave} loading={loading} />
//     </AuthLayout>
//   );
// };

// export default RichEditor;






// import React, { useEffect, useState, useRef } from "react";
// import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css";
// import styles from "./RichEditor.module.css";
// import Button from "../Button/Button";
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

// const RichEditor: React.FC<Props> = ({ pageId }) => {
//   console.log("Page initial", pageId);

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
//         console.log("Updating page", pageId);
//         await updatePage({
//           id: pageId,
//           data: { title: page.title, content: processedContent },
//         }).unwrap();
//         toast.success("Page updated successfully");
//       } else {
//         console.log("Creating new page");
//         const res = await createPage({
//           title: page.title,
//           content: processedContent,
//         }).unwrap();
//         console.log("Created Page:", res);
//         toast.success("Page created successfully");
//       }
//     } catch (err: any) {
//       console.error("Save error:", err);
//       toast.error(err?.message || "Failed to save page");
//     }
//   };

//   const insertVariable = (variable: string) => {
//     const editor = quillRef.current?.getEditor();
//     if (!editor) return;

//     const range = editor.getSelection();
//     const position = range?.index ?? editor.getLength();
//     editor.insertText(position, variable);
//     editor.setSelection(position + variable.length, 0);
//   };

//   const isLoading = isFetching || isCreating || isUpdating;
  

//   return (
//     <AuthLayout  fullWidth>
//       <input
//         type="text"
//         placeholder="Page title"
//         value={page.title}
//         onChange={(e) => setPage({ ...page, title: e.target.value })}
//         className={styles.titleInput}
//       />

      
//       <ReactQuill
//         ref={quillRef}
//         theme="snow"
//         value={page.content}
//         onChange={(value) => setPage({ ...page, content: value })}
//         className={styles.quillEditor}
//         placeholder="Start writing your content here..."
//       />

//       <div className={styles.variablesList}>
//         {["{{name}}", "{{email}}"].map((v, i) => (
//           <span
//             key={i}
//             className={styles.variableTag}
//             onClick={() => insertVariable(v)}
//           >
//             {v.replace(/[{}]/g, "")}
//           </span>
//         ))}
//       </div>

//       <Button label="Save" onClick={handleSave} loading={isLoading} />
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
import { type Props } from "../../types/page";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import {
  useGetPageByIdQuery,
  useCreatePageMutation,
  useUpdatePageMutation,
} from "../../store/services/page.api";
import AuthLayout from "../Layout/Layout";
import { Navigate } from "react-router";

const RichEditor: React.FC<Props> = ({ pageId }) => {
  console.log("Page initial", pageId);

  const { user } = useSelector((state: RootState) => state.auth);
  const [page, setPage] = useState({ title: "", content: "" });
  const quillRef = useRef<ReactQuill | null>(null);

  const { data: pageData, isFetching } = useGetPageByIdQuery(pageId!, {
    skip: !pageId || pageId.trim() === "",
  });

  const [createPage, { isLoading: isCreating }] = useCreatePageMutation();
  const [updatePage, { isLoading: isUpdating }] = useUpdatePageMutation();

  useEffect(() => {
    if (pageData?.data) {
      setPage({
        title: pageData.data.title ?? "",
        content: pageData.data.content ?? "",
      });
      console.log("Fetched Page:", pageData);
    }
  }, [pageData]);

  const replaceVariables = (content: string): string => {
    if (!user) return content;
    return content
      .replace(/\{\{name\}\}/g, (user as any).name || "")
      .replace(/\{\{email\}\}/g, (user as any).email || "");
  };

  const handleSave = async () => {
    if (!page.title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    try {
      const processedContent = replaceVariables(page.content);

      if (pageId && pageId.trim() !== "") {
        await updatePage({
          id: pageId,
          data: { title: page.title, content: processedContent },
        }).unwrap();
        toast.success("Page updated!");
      } else {
        const res = await createPage({
          title: page.title,
          content: processedContent,
        }).unwrap();
        console.log("Created:", res);
        toast.success("Page created!");
        setPage({
          title: "",
          content: "",
        });
        // navigate(-1)
      }
    } catch (err: any) {
      toast.error(err?.message || "Save failed");
    }
  };

  const insertVariable = (variable: string) => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;

    const range = editor.getSelection();
    const pos = range?.index ?? editor.getLength();
    editor.insertText(pos, variable);
    editor.setSelection(pos + variable.length, 0);
  };

  return (
    <AuthLayout fullWidth>

      
      <Input
        fullWidth
        label="Title"
        name={"title" as any}
        type="text"
        value={page.title}
        onChange={(e) => setPage({ ...page, title: e.target.value })}
        placeholder="Enter title"
        required={true}
      />

      {/* ✅ QUILL EDITOR */}
      <div className={styles.editorLabel}>Content</div>

      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={page.content}
        onChange={(value) => setPage({ ...page, content: value })}
        className={styles.quillEditor}
        placeholder="Start writing..."
      />

      {/* ✅ VARIABLE TAGS */}
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

      {/* ✅ SAVE BUTTON */}
      <Button
        label="Save"
        onClick={handleSave}
        loading={isFetching || isCreating || isUpdating}
      />

    </AuthLayout>
  );
};

export default RichEditor;
