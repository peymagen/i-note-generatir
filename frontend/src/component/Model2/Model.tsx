import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type {
  SubmitHandler,
  FieldErrors,
  Path,
  DefaultValues,
} from "react-hook-form";
import type { AnyObjectSchema } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { RxCross2 } from "react-icons/rx";

import Input from "../Input/Input2";
import RichTextEditor from "../RichEditor/RichEditor";
import Button from "../Button/Button";
import styles from "./Model.module.css";

/* ---------------- TYPES ---------------- */

export type FieldType = "input" | "richtext";

export interface FieldConfig<T extends Record<string, unknown>> {
  name: Path<T>;
  label: string;
  type: FieldType;
  required?: boolean;
}

interface ModalProps<T extends Record<string, unknown>> {
  title: string;
  form: DefaultValues<T>;
  fields: FieldConfig<T>[];
  schema: AnyObjectSchema;
  onClose: () => void;
  onSave: (data: T) => void;
}

/* ---------------- COMPONENT ---------------- */

const Modal = <T extends Record<string, unknown>>({
  title,
  form,
  fields,
  schema,
  onClose,
  onSave,
}: ModalProps<T>) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<T>({
    resolver: yupResolver(schema),
    defaultValues: form,
    mode: "onBlur",
  });

  /* Sync form when edit data changes */
  useEffect(() => {
    reset(form);
  }, [form, reset]);

  const onSubmit: SubmitHandler<T> = (data) => {
    onSave(data);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalBox}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ---------- HEADER ---------- */}
        <div className={styles.modalHeader}>
          <h2>{title}</h2>
          <RxCross2
            className={styles.closeIcon}
            onClick={onClose}
          />
        </div>

        {/* ---------- FORM ---------- */}
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
  <div className={styles.formBody}>
    {fields.map((field) => {
      if (field.type === "richtext") {
        return (
          <RichTextEditor<T>
            key={field.name}
            label={field.label}
            name={field.name}
            watch={watch}
            setValue={setValue}
            required={field.required}
            errors={errors as FieldErrors<T>}
          />
        );
      }

      return (
        <Input<T>
          key={field.name}
          label={field.label}
          name={field.name}
          register={register}
          required={field.required}
          errors={errors as FieldErrors<T>}
        />
      );
    })}
  </div>

  <div className={styles.modalActions}>
    <Button type="button" label="Cancel" buttonType="three" onClick={onClose} />
    <Button type="submit" label="Submit" buttonType="one" />
  </div>
</form>

      </div>
    </div>
  );
};

export default Modal;
