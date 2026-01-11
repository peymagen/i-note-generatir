import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import styles from "./ManageTemplete.module.css";
import Button from "../../component/Button/Button";
import RichTextEditor from "../../component/RichEditor/RichEditor";
import Input from "../../component/Input/Input2";
import { toast } from "react-toastify";
import { useRef } from "react";
import type { Editor } from "@ckeditor/ckeditor5-core";

import {
  useCreatePageMutation,
  useUpdatePageMutation,
} from "../../store/services/page.api";

import type { ITemplate } from "../../types/templates";

interface Props {
  mode: "create" | "edit";
  defaultValues?: ITemplate;
  onSuccess: () => void;
}

interface TemplateForm {
  title: string;
  content: string;
}

const TemplateFormModal: React.FC<Props> = ({
  mode,
  defaultValues,
  onSuccess,
}) => {
  console.log(defaultValues);
  const [createPage] = useCreatePageMutation();
  const [updatePage] = useUpdatePageMutation();

  const editorInstanceRef = useRef<Editor | null>(null);

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TemplateForm>({
    defaultValues: {
      title: "",
      content: "",
    },
  });

  useEffect(() => {
    if (mode === "edit" && defaultValues) {
      reset({
        title: defaultValues.title,
        content: defaultValues.content,
      });
    }
  }, [mode, defaultValues, reset]);

  const onSubmit = async (formData: TemplateForm) => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      if (mode === "edit" && defaultValues) {
        await updatePage({
          id: defaultValues.id,
          data: formData,
        }).unwrap();
        toast.success("Template updated");
      } else {
        await createPage(formData).unwrap();
        toast.success("Template created");
      }

      onSuccess();
      reset();
    } catch {
      toast.error("Save failed");
    }
  };
  const TEMPLATE_VARIABLES = [
    { label: "File No (User)", value: "{{FILE_NO}}" },
    { label: "Consignee Code (PO Detail)", value: "{{CONSIGNEE_CODE}}" },
    { label: "Order Date (PO Header)", value: "{{ORDER_DATE}}" },
    { label: "Vendor Details", value: "{{VENDOR_DETAILS}}" },
    { label: "Financial Year", value: "{{FINANCIAL_YEAR}}" },
    { label: "Unique I-Note No", value: "{{INOTE_NO}}" },
    { label: "MO Address (Warehousing)", value: "{{MO_ADDRESS_WAREHOUSE}}" },
    { label: "MO Address (Procurement)", value: "{{MO_ADDRESS_PROCUREMENT}}" },
    { label: "Indent No", value: "{{INDENT_NO}}" },
    { label: "Current Date", value: "{{CURRENT_DATE}}" },
    { label: "Inspection Date", value: "{{INSPECTION_DATE}}" },
    {
      label: "Inspection Evaluation (From–To)",
      value: "{{INSPECTION_EVAL_RANGE}}",
    },
    { label: "Total Items Selected", value: "{{TOTAL_ITEMS}}" },
    { label: "Item Details", value: "{{ITEM_DETAILS}}" },
  ];

  const insertVariable = (variable: string) => {
    const editor = editorInstanceRef.current;
    if (!editor) return;

    editor.model.change((writer) => {
      const position = editor.model.document.selection.getFirstPosition();

      if (!position) return;
      writer.insertText(variable, position);
    });

    // Sync back to RHF
    const data = editor.getData();
    setValue("content", data, { shouldDirty: true });
  };

  return (
    <form className={styles.editorArea} onSubmit={handleSubmit(onSubmit)}>
      {/* TITLE */}
      <Input
        label="Template Title"
        name="title"
        register={register}
        errors={errors}
        required
      />

      {/* CONTENT */}
      <RichTextEditor
        label="Template Content"
        name="content"
        watch={watch}
        setValue={setValue}
        errors={errors}
        onEditorReady={(editor) => {
          editorInstanceRef.current = editor;
        }}
        required
      />
      {/* TEMPLATE VARIABLES */}
      <div className={styles.variableBar}>
        {TEMPLATE_VARIABLES.map((item) => (
          <button
            key={item.value}
            type="button"
            className={styles.variableBtn}
            onClick={() => insertVariable(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <Button
        label={mode === "edit" ? "Update Template" : "Save Template"}
        buttonType="three"
        type="submit"
      />
    </form>
  );
};

export default TemplateFormModal;
