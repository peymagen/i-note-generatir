import { useState } from "react";
import { useForm } from "react-hook-form"; // Import this
import styles from "./Inote.module.css";
import Button from "../../component/Button/Button";
import Modal from "../../component/Modal/index";
import StepperForm from "./StepperForm";
import RichTextEditor from "../../component/RichEditor/RichEditor";
import type { StepperState } from "../../types/inote";

// Define a type for the editor form
interface EditorForm {
  editorContent: string;
}

const Inote = () => {
  const [addModal, setAddModal] = useState<boolean>(false);
  const [showEditor, setShowEditor] = useState<boolean>(false);

  // 1. Initialize React Hook Form
  const {
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<EditorForm>({
    defaultValues: {
      editorContent: "",
    },
  });

  const processTemplate = (html: string, state: StepperState) => {
    if (!html) return "";
    // const header = state.indentInfo.header[0] || {};
    console.log("State:", state);
    // Financial Year Logic
    const now = new Date();
    const year = now.getFullYear();
    const financialYear =
      now.getMonth() >= 3
        ? `${year}-${(year + 1).toString().slice(-2)}`
        : `${year - 1}-${year.toString().slice(-2)}`;

    const replacements: Record<string, string> = {
      "{{FINANCIAL_YEAR}}": financialYear,
      "{{INDENT_NO}}": state.user.IndentNo || "N/A",
      "{{CURRENT_DATE}}": new Date().toLocaleDateString("en-GB"),
      "{{ORDER_DATE}}": state.user.OrderDate || "N/A",
      "{{CONSIGNEE_CODE}}": state.indentInfo.details[0].ConsigneeCode || "N/A",
      "{{INSPECTION_EVAL_RANGE}}": state.user.InspectionOfferedDate || "N/A",
      "{{INSPECTION_DATE}}": state.user.InspectedOn || "N/A",
    };

    let updatedHtml = html;
    Object.keys(replacements).forEach((key) => {
      updatedHtml = updatedHtml.replaceAll(key, replacements[key]);
    });

    return updatedHtml;
  };

  const handleStepperComplete = (state: StepperState) => {
    const readyHtml = processTemplate(state.content, state);

    // 2. Set the processed HTML into the form state
    setValue("editorContent", readyHtml);

    setShowEditor(true);
    setAddModal(false);
  };

  const onFinalSubmit = (data: EditorForm) => {
    console.log("Final Edited Content to Save:", data.editorContent);
    // Here you would call your API to save the I-Note
  };

  return (
    <div className={styles.container}>
      <div className={styles.btnWrapper}>
        <Button
          label="Add New I-Note"
          buttonType="three"
          onClick={() => setAddModal(true)}
        />
      </div>

      <h1 className={styles.pageTitle}>I-Note Management</h1>

      {/* 3. Render the RichTextEditor instead of dangerouslySetInnerHTML */}
      {showEditor && (
        <form
          onSubmit={handleSubmit(onFinalSubmit)}
          className={styles.editorWrapper}
        >
          <div className={styles.pagePaper}>
            <RichTextEditor<EditorForm>
              label="Edit I-Note Content"
              name="editorContent"
              watch={watch}
              setValue={setValue}
              errors={errors}
            />
          </div>

          <div className={styles.actionButtons}>
            <Button label="Save Final I-Note" type="submit" buttonType="one" />
            <Button
              label="Print"
              onClick={() => window.print()}
              buttonType="two"
            />
          </div>
        </form>
      )}

      {addModal && (
        <Modal
          title="Add New Inspection"
          size="xl"
          onClose={() => setAddModal(false)}
        >
          <StepperForm onComplete={handleStepperComplete} />
        </Modal>
      )}
    </div>
  );
};

export default Inote;
