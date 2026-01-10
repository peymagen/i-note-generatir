import { useState } from "react";
import { useForm } from "react-hook-form"; // Import this
import styles from "./Inote.module.css";
import Button from "../../component/Button/Button";
import Modal from "../../component/Modal/index";
import StepperForm from "./StepperForm";
import RichTextEditor from "../../component/RichEditor/RichEditor";
import type { StepperState } from "../../types/inote";
import { toWords } from "number-to-words";
import type { PoDetailItem } from "../../types/poDetail";
import type { itemDetail } from "../../types/itemDetail";

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

    const table = [
      `<table border="1" cellpadding="5" cellspacing="0"><tr>
      <th>Item No in A/T (OL No)</th>
      <th colspan="2"><u>Description of store</u>Total Quantity Ordered<br/>The Inspector should indicate whether the Supply has been made in seller's / buyer's</th>
      <th>Acc Unit</th><th>Tendered Quantity</th><th>Accepted Quantity</th><th>Brought to account in ledger folio Total Qty Accepted to</th>
      <th>Rejected Quantity</th><th>No and date of inspection certificate (if any) issued by DGISM or other Insp. Authority</th>
      <th>Remarks</th></tr>`,
      ...(state?.products?.map(
        (p: PoDetailItem & itemDetail & { acceptedQty: number }) => {
          const itemDesc = p.ItemDesc || "";
          const itemDeno = p.ItemDeno || "";
          const acceptedQty = p.acceptedQty || p.Qty || 0;
          return `<tr><td>${p.OrderLineNo}</td><td>${
            p.ItemCode
          }<br/>${itemDesc}</td><td>Qty ${p.Qty}</td>
        <td>${itemDeno}</td><td>${p.Qty}</td><td>${acceptedQty}</td><td>${
            acceptedQty === p.Qty ? acceptedQty : acceptedQty + " / " + p.Qty
          }</td><td>0</td><td colspan="2"></td></tr>`;
        }
      ) || []),
      "</table>",
    ].join("");

    const replacements: Record<string, string> = {
      "{{FINANCIAL_YEAR}}": financialYear,
      "{{INDENT_NO}}": state.user.IndentNo || "N/A",
      "{{CURRENT_DATE}}": new Date().toLocaleDateString("en-GB"),
      "{{ORDER_DATE}}": state.user.OrderDate || "N/A",
      "{{CONSIGNEE_CODE}}": state.indentInfo.details[0].ConsigneeCode || "N/A",
      "{{INSPECTION_EVAL_RANGE}}": state.user.InspectionOfferedDate || "N/A",
      "{{INSPECTION_DATE}}": state.user.InspectedOn || "N/A",
      "{{TOTAL_ITEMS}}": state?.products?.length.toString() || "0",
      "{{TOTAL_ITEMS_ WORD}}":
        toWords(state?.products?.length.toString() || 0).toUpperCase() ||
        "Zero",
      "{{ITEM_DETAILS}}": table,
    };

    let updatedHtml = html;
    Object.keys(replacements).forEach((key) => {
      updatedHtml = updatedHtml.replaceAll(key, replacements[key]);
    });

    return updatedHtml;
  };

  const handleStepperComplete = (state: StepperState) => {
    const readyHtml = processTemplate(state.content, state);
    console.log("Processed HTML Content:", readyHtml);
    // 2. Set the processed HTML into the form state
    setValue("editorContent", readyHtml);

    setShowEditor(true);
    setAddModal(false);
  };

  const handlePrint = () => {
    const content = watch("editorContent");
    console.log("Printing Content:", content);
    const printWindow = window.open("", "", "width=800,height=600");
    if (!printWindow) return;

    printWindow.document.write(`
    <html>
      <head>
        <title>Print I-Note</title>
        <style>
         body {
            font-family: Arial;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          table, th, td {
            border: 1px solid black;
          }
		  .table{
				margin: 0 !important;
		  }
		  .header, .header th, .header td{
            border: 1px solid white !important;
		  }
		 td{
			vertical-align: top;
		 }
		 .fancy{
			 border-top: 1px solid black !important;
			 border-bottom: 1px solid black !important;
			 padding: 5px 0 !important;
		 }
		 .fancy td{
		     text-align: center !important;
		 }
    .midd tr > td:nth-child(4) {
      border-bottom: 1px solid #ffffff !important;
      border-top: 1px solid #ffffff !important;
    }
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
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
            <Button label="Print" onClick={handlePrint} buttonType="two" />
          </div>
        </form>
      )}

      {addModal && (
        <Modal
          title="Add I-Note"
          size={"xl"}
          onClose={() => setAddModal(false)}
        >
          <StepperForm onComplete={handleStepperComplete} />
        </Modal>
      )}
    </div>
  );
};

export default Inote;
