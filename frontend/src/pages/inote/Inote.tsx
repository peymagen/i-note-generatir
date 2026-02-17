import { useMemo, useCallback, useState } from "react";
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
import {
  useGetFinalQuery,
  usePostFinalMutation,
  useUpdateFinalPageMutation,
  useDeleteFinalPageMutation,
} from "../../store/services/final";

import { FiEdit, FiTrash2, FiPrinter } from "react-icons/fi";
import ConfirmDialog from "../../component/ConfirmDialoge";
import { DataTable } from "../../component/DataTable/DataTable";
import { toast } from "react-toastify";
import Manipulate from "./Manipulate";

// Define a type for the editor form

type final = {
  id?: number;
  content: string;
  i_note: number;
  indent_no?: string;
};
interface EditorForm {
  editorContent: string;
  i_note?: number;
}

const renderCleanAddress = (address: string | undefined) => {
  if (!address) return undefined;
  const key = "Material Organisation";
  const startPos = address.indexOf(key);
  return startPos !== -1 ? address?.substring(startPos) : address;
};

const extractFromParens = (str: string | null | undefined) => {
  const match = str?.match(/\((.*?)\)/);
  return match ? match[1] : str;
};

// function formatDate(dateStr:string) {
//   const [year, month, day] = dateStr.split("-");
//   return `${day}-${month}-${year}`;
// }


const formatDate = (dateStr: string): string => {
  // Handle ranges like "26 to 28-02-2026"
  if (dateStr.includes(' to ')) {
    const parts = dateStr.split(' to ');
    return `${formatSingleDate(parts[0])} to ${formatSingleDate(parts[1])}`;
  }
  return formatSingleDate(dateStr);
};

const formatSingleDate = (dateStr: string): string => {
  // Clean the string and handle DD-MM-YYYY or YYYY-MM-DD
  let date: Date;
  
  if (dateStr.includes('-') && dateStr.split('-')[0].length === 2) {
    // Convert DD-MM-YYYY to YYYY-MM-DD for standard parsing
    const [d, m, y] = dateStr.split('-');
    date = new Date(`${y}-${m}-${d}`);
  } else {
    date = new Date(dateStr);
  }

  if (isNaN(date.getTime())) return dateStr; // Fallback if parsing fails

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: '2-digit'
  }).format(date).replace(/ /g, '-'); 
  // Result: 14-Feb-26
};


const Inote = () => {
  const [stepperData, setStepperData] = useState<StepperState | null>(null);
  const [page, setPage] = useState(1);
  const limit = 50;
  const [search, setSearch] = useState<string | undefined>(undefined);

  const { data, isLoading, refetch } = useGetFinalQuery(
    { page, limit, search },
    { refetchOnMountOrArgChange: true },
  );

  const [save] = usePostFinalMutation();
  const [update] = useUpdateFinalPageMutation();
  const [deleteFinalPage] = useDeleteFinalPageMutation();

  const [editingForm, setEditingForm] = useState<final | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<final | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
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

    const moAddress = state.info?.mo[0]?.MoAddress;

    // Financial Year Logic
    const now = new Date();
    const year = now.getFullYear();
    const financialYear =
      now.getMonth() >= 3
        ? `${year}`
        : `${year - 1}`;

    const table = [
      `<table border="1" cellpadding="5" cellspacing="0"
    style="border-collapse: collapse; width: 100%; font-size: 11px; text-align: center; border-color: #000;">
    <thead>
      <tr> 
        <td>Item No in A/T (OL No)</td>
        <td colspan="2"><u>Description of store</u><br/>Total Quantity Ordered.<br/>The Inspector should indicate whether<br/>the supply has been made in seller's / buyer's<br> container's, where stores are required int he supplied in containers</td>
        <td>Acc Unit</td>
        <td>Tendered Quantity</td>
        <td>Accepted Quantity</td>
        <td>Brought to account in ledger folio Total Qty Accepted to Date</td>
        <td>Rejected Quantity</td>
        <td style="border-right: 1px solid black;">No and date of inspection certificate (if any) issued by DGISAM or other Isp. Authority</td>
        <td>Remarks</td>
      </tr>
    </thead>`,
      ...(state?.products?.map(
        (p: PoDetailItem & itemDetail & { acceptedQty: number }) => {
          const itemDesc = p.ItemDesc || "";
          const itemDeno = p.ItemDeno || "";
          const acceptedQty = p.acceptedQty || p.Qty || 0;

          const noRowBorder =
            'style=" vertical-align: top; padding-top: 15px;"';
          const descText =
            'style="border-right: none; text-align: left; vertical-align: top; padding-top: 15px; width:40%;"';
          const qtyColumn =
            'style=" border-left: none; vertical-align: top; padding-top: 15px; width:10%;"';

          // Removed border-right for the Inspection column to merge it visually with Remarks
          const noBorderRight =
            'style="border-top: none; border-bottom: none; border-right: none; vertical-align: top; padding-top: 15px;"';
          // Removed border-left for the Remarks column
          const noBorderLeft =
            'style="border-top: none; border-bottom: none; border-left: none; vertical-align: top; padding-top: 15px;"';

          const qty = p.Qty || 0;
          const qtyFullFill = p.QtyFullFill || 0;

          return `<tr>
        <td ${noRowBorder}>${p.OrderLineNo}</td>
        <td ${descText}>${p.ItemCode}<br/>${itemDesc}</td>
        <td ${qtyColumn}>Qty ${qty}</td>
        <td ${noRowBorder}>${itemDeno}</td>
        <td ${noRowBorder}>${qty - qtyFullFill}</td>
        <td ${noRowBorder}>${acceptedQty - qtyFullFill}</td>
        <td ${noRowBorder}>${acceptedQty === qty && qtyFullFill === 0 ? acceptedQty : acceptedQty + " / " + qty}</td>
        <td ${noRowBorder}>0</td>
        <td ${noBorderRight}></td>
        <td ${noBorderLeft}></td>
      </tr>`;
        },
      ) || []),
      "</table>",
    ].join("");

    const replacements: Record<string, string> = {
      "{{FINANCIAL_YEAR}}": financialYear,
      "{{INDENT_NO}}": state.user.IndentNo || "N/A",
      "{{CURRENT_DATE}}":  new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "2-digit",
        }).replace(/ /g, "-"),

      "{{ORDER_DATE}}":
        new Date(state.user.OrderDate)
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
          .replace(/ /g, "-") || "N/A",
      // "{{CONSIGNEE_CODE}}": state.indentInfo.details[0].ConsigneeCode || "N/A",   setConsigneeCode;
      "{{CONSIGNEE_CODE}}":(extractFromParens(state.indentInfo.details[0]?.ConsigneeCode) || "")|| "N/A",
      "{{INDENT_DATE}}": formatDate(state.user.date) || "N/A",
      "{{INSPECTION_EVAL_RANGE}}": formatDate(state.user.InspectionOfferedDate) || "N/A",
      "{{INSPECTION_DATE}}": formatDate(state.user.InspectedOn) || "N/A",
      "{{TOTAL_ITEMS}}": state?.products?.length.toString() || "0",
      "{{VENDOR_NAME}}": state.info?.vendor[0]?.FirmName || "N/A",
      "{{VENDOR_DETAILS}}": `
        <div style="margin-top:-8px;"id="vendorBlock" >
          ${(state.info?.vendor[0]?.FirmAddress || "N/A").replace(
        /(<br\s*\/?>\s*){2,}/gi,
        "<br>",
      )}
        </div>`,

      "{{MO_ADDRESS_WAREHOUSE}}": renderCleanAddress(moAddress) || "N/A",
      "{{MO_ADDRESS_PROCUREMENT}}": renderCleanAddress(moAddress) || "N/A",
      "{{FILE_NO}}": state.user.sequenceNo?.toString() || "N/A",
      "{{INOTE_NO}}": state.info?.iNote?.iNote?.toString() || "N/A",
      "{{TOTAL_ITEMS_WORD}}":
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

  const items = useMemo(() => data?.data?.data ?? [], [data?.data?.data]);
  const totalRecords = data?.data?.pagination?.totalRecords ?? 0;

  const fetchData = useCallback(
    async (params?: { page?: number; search?: string }) => {
      if (params?.search !== undefined && params.search !== search) {
        setSearch(params.search);
        setPage(1);
      }
      if (params?.page && params.page !== page) {
        setPage(params.page);
      }
      return { data: items, total: totalRecords };
    },
    [items, totalRecords, page, search],
  );
  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    setLoadingAction(deleteTarget?.id?.toString() || "");
    await deleteFinalPage(deleteTarget.id).unwrap();
    toast.success("Deleted");
    setDeleteTarget(null);
    refetch();
  };

  const columns = [
    { label: "ID", accessor: "id" },
    { label: "I-Note", accessor: "i_note" },
    { label: "Indent No", accessor: "indent_No" },
  ];
  const actions = [
    {
      label: "Edit",
      onClick: () => { },

      component: (row: final) => (
        <button
          className={`${styles.iconBtn} ${styles.edit}`}
          title="Edit User"
          onClick={() => {
            setEditingForm(row);
            setShowEditor(true);
            setValue("editorContent", row.content);
          }}
        >
          <FiEdit size={18} />
        </button>
      ),
    },
    {
      label: "Delete",
      onClick: () => { },
      component: (row: final) => (
        <button
          className={`${styles.iconBtn} ${styles.delete}`}
          title="Delete"
          onClick={() => setDeleteTarget(row)}
        >
          <FiTrash2 size={18} />
        </button>
      ),
    },
    {
      label: "Print",
      onClick: () => { },
      component: (row: final) => (
        <button
          className={`${styles.iconBtn} ${styles.edit}`}
          title="Print I-Note"
          onClick={() => handlePrint(row.content)}
        >
          <FiPrinter size={18} />
        </button>
      ),
    },
  ];
  const handleStepperComplete = (state: StepperState) => {
    setStepperData(state);
    const readyHtml = processTemplate(state.content, state);

    // 2. Set the processed HTML into the form state
    setValue("editorContent", readyHtml);

    setShowEditor(true);
    setAddModal(false);
  };



  const handlePrint = (content: string) => {
    const printWindow = window.open("", "", "width=800,height=600");
    if (!printWindow) return;

    const fontUrl = `${window.location.origin}/Shivaji01-Normal.ttf`;

    const underlineStatic = [
      "DETAILS OF STORES INSPECTED",
      "Description of stores",
      "Remark",
    ];

    let updatedContent = content;

    // underline static words
    underlineStatic.forEach((word) => {
      const regex = new RegExp(
        word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "g",
      );
      updatedContent = updatedContent.replace(
        regex,
        `<span class="underline-IN">${word}</span>`,
      );
    });
    updatedContent = updatedContent.replace(
      /सामान का विवरण[\s\S]*?(?=<\/td>)/g,
      (match) => `<span class="underline-IN">${match}</span>`,
    );

    updatedContent = updatedContent.replace(
      /<strong>\s*INSPECTION NOTE\s*<\/strong>/g,
      `<strong><span class="underline-IN">INSPECTION NOTE</span></strong>`,
    );

    // underline dynamic "INSPECTION NOTE NO. …"
    updatedContent = updatedContent.replace(
      /<strong>INSPECTION NOTE NO\.[^<]*<\/strong>/g,
      (match) =>
        `<strong><span class="underline-IN">${match.replace(/<\/?strong>/g, "")}</span></strong>`,
    );

    // updatedContent = updatedContent.replace(
    //   /Contractor's Name and Address/g,
    //   `<span class="force-newline">Contractor's Name and Address</span>`
    // );

    const processedContent = updatedContent
      // Wrap Hindi characters with <span class="hindi-text">
      .replace(/([\u0900-\u097F]+)/g, '<span class="hindi-text">$1</span>');

    printWindow.document.write(`
    <html>
      <head>       
        <style>
      
        

        @font-face {
          font-family: 'Shivaji01';
          src: url('${fontUrl}') format('truetype');
        }

        body {
          font-family: Arial, sans-serif !important;
        }
         

        /* Anything wrapped by auto-detection becomes Hindi */
        .hindi-text {
          font-family: 'Shivaji01' !important;
        }



          // body { font-family: Arial; }

        p { font-size: 9.5pt; margin: 10px 0; }
        h1 { font-size: 24pt; margin: 16px 0 12px 0; }
        h2 { font-size: 20pt; margin: 14px 0 10px 0; }
        h3 { font-size: 18pt; margin: 12px 0 8px 0;font-weight: bold; }
         
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

          figure.table:nth-of-type(1) table td,
          figure.table:nth-of-type(1) table th,
          figure.table:nth-of-type(3) table td,
          figure.table:nth-of-type(3) table th {
              border-left: 1px solid white !important;
              border-right: 1px solid white !important;
              border-top: 1px solid white !important;
              border-bottom: 1px solid white !important;
          }

          figure.table:nth-of-type(1) table {
            font-size: 10pt !important;
          }
          figure.table:nth-of-type(1) table.hindi {
            font-size: 11.5pt !important;
          }

          figure.table:nth-of-type(2) table td,
          figure.table:nth-of-type(2) table th {
              padding: 3pt 4pt !important;   
              line-height: 1.4 !important;
          }

          figure.table:nth-of-type(2) table{
              padding:10pt !important;
              font-size: 10pt !important;
          }
          figure.table:nth-of-type(2) table .hindi-text{
          font-size: 10pt !important;
          }


          /* Hindi font in 3rd table */
          figure.table:nth-of-type(3) table .hindi-text {
            font-family: 'Shivaji01' !important;
            font-size: 12.5pt !important;

          }

          /* English in 3rd table */
          figure.table:nth-of-type(3) table {
            font-size: 10.5pt !important;
          }

          .underline-IN {
            text-decoration: underline !important;
          }


          ol figure.table:nth-of-type(1) table,
          // ol figure.table:nth-of-type(2) table
          {
                display: block;
                
                // width: 150% !important;        
                // transform: scale(0.68);         
                // transform-origin: top left;    
                // table-layout: auto !important; 
              
          }


          // ol li {
          //     position: relative;
          // }

          /* cells of 1st and 2nd table */
          ol figure.table:nth-of-type(1) table td,
          ol figure.table:nth-of-type(1) table th,
          ol figure.table:nth-of-type(2) table td,
          ol figure.table:nth-of-type(2) table th {
              padding-top:2pt;
              line-height: 1.2 !important;
              word-break: break-word !important;
              border:none !important;
              border-left: 1px solid white !important;
              border-right: 1px solid white !important;
              text-align:center !important;
              font-size: 7.3pt !important;
          }

          ol li {
            font-size: 8pt !important;
            line-height: 1.5 !important;
            margin-bottom: 1pt !important;
          }
            ol li.hindi-text {
            
                font-size: 12pt !important;
            }

          
          ol > li:nth-of-type(2) div{
              display: inline !important;
              }
          ol > li:nth-of-type(2) div p {
              display: inline !important;
              white-space: nowrap !important;
              margin: 0 !important;
              padding: 0 !important;
          }

          /* Remove line breaks inside vendor address */
          ol > li:nth-of-type(2) div p br {
              display: none !important;
          }

          /* Make all tables in bullet 9 wider and left-aligned */
          ol > li:nth-of-type(9) figure.table table:nth-of-type(1),
          ol > li:nth-of-type(9) figure.table table:nth-of-type(2){
              width: 108% !important;   /* expand left */
              transform: translateX(-6.5%) !important; 
              // margin-left: -4% !important;
              table-layout: auto !important;
          }

       /* TABLE 4 SPACER FIX — DO NOT HIDE COLUMN 4 */
figure.table:nth-of-type(4) table td:nth-child(4),
figure.table:nth-of-type(4) table th:nth-child(4) {
    width: 40px !important;      /* your gap width */
    border: none !important;     /* remove borders */
    background: white !important;/* blank space */
    border-top: 1px solid white !important;
    border-bottom: 1px solid white !important;
}

/* ADD RIGHT BORDER ON COLUMN 3 */
figure.table:nth-of-type(4) table td:nth-child(3),
figure.table:nth-of-type(4) table th:nth-child(3) {
    border-right: 1.5px solid black !important;
}

/* ADD LEFT BORDER ON COLUMN 5 */
figure.table:nth-of-type(4) table td:nth-child(5),
figure.table:nth-of-type(4) table th:nth-child(5) {
    border-left: 1.5px solid black !important;
}
 



        </style>
      </head>
      <body>
        ${processedContent}
      </body>
    </html>
  `);

    printWindow.document.close();
    printWindow.focus();

    printWindow.onload = () => {
      if (printWindow.document.fonts) {
        printWindow.document.fonts.ready.then(() => {
          printWindow.print();
          printWindow.close();
        });
      } else {
        // Fallback
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 100);
      }
    };
  };

  const onFinalSubmit = async (formData: EditorForm) => {
    // Initialize the payload
    const body = {
      content: formData.editorContent,
      i_note: stepperData?.info?.iNote?.iNote,
      indent_no: stepperData?.user?.IndentNo,
      id: undefined as number | undefined,
    };

    if (stepperData && !editingForm) {
      body.i_note = stepperData.info?.iNote?.iNote || 0;
      body.indent_no = stepperData.user?.IndentNo || "";
    }

    // CASE 2: Editing an EXISTING I-Note (Data comes from Table Row)
    else if (editingForm) {
      body.i_note = editingForm.i_note;
      body.id = editingForm.id;
      body.content = formData.editorContent;
      body.indent_no = (editingForm as final).indent_no || "";
    }

    try {
      if (editingForm) {
        const res = await update(body).unwrap();

        if (res?.data) {
          toast.success("Updated Successfully");
          refetch();
          setShowEditor(false);
          setEditingForm(null);
          setStepperData(null);
        }
      } else {
        const res = await save(body).unwrap();

        if (res?.data) {
          toast.success("Saved Successfully");
          refetch(); // Refresh the table
          setShowEditor(false);
          setEditingForm(null); // Clear edit state
          setStepperData(null); // Clear stepper state
        }
      }
    } catch (error) {
      console.error("Save failed", error);
      toast.error("Failed to save I-Note");
    }
  };

  const [manipulate, setManipulate] = useState<boolean>(false);

  return (
    <div className={styles.container}>
      <div className={styles.btnWrapper}>
        <Button
          label="Add I-Note"
          buttonType="one"
          onClick={() => setAddModal(true)}
        />

        <Button
          label="Current I-Note"
          buttonType="one"
          onClick={() => {
            setManipulate(true);
            // setAddModal(true);
          }}
        />
      </div>

      <h1 className={styles.pageTitle}>I-Note</h1>

      <div className={styles.tableBox}>
        <DataTable<final & { [x: string]: unknown }>
          fetchData={fetchData}
          loading={isLoading}
          isSearch
          isNavigate
          isExport
          columns={columns}
          actions={actions}
        />
      </div>
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Item"
          message={`Are you sure you want to delete ${deleteTarget.id}? This action cannot be undone.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={loadingAction === deleteTarget.id?.toString()}
        />
      )}

      {/* 3. Render the RichTextEditor instead of dangerouslySetInnerHTML */}

      {showEditor && (
        <Modal
          title="Add I-Note"
          size="xl"
          onClose={() => {
            setShowEditor(false);
          }}
        >
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
              <Button
                label="Save Final I-Note"
                type="submit"
                buttonType="three"
              />
              <Button
                label="Print"
                onClick={() => handlePrint(watch("editorContent"))}
                buttonType="two"
              />
            </div>
          </form>
        </Modal>
      )}

      {editingForm && showEditor && (
        <Modal
          title="Edit I-Note"
          size="xl"
          onClose={() => {
            setEditingForm(null);
            setShowEditor(false);
            setValue("editorContent", "");
          }}
        >
          <form
            onSubmit={handleSubmit(onFinalSubmit)}
            className={styles.modalEditorWrapper}
          >
            <RichTextEditor<EditorForm>
              label="Edit I-Note Content"
              name="editorContent"
              watch={watch}
              setValue={setValue}
              errors={errors}
            />

            <div className={styles.modalActions}>
              <Button label="Update I-Note" type="submit" buttonType="three" />
              <Button
                label="Cancel"
                buttonType="three"
                onClick={() => setEditingForm(null)}
              />
            </div>
          </form>
        </Modal>
      )}

      {manipulate && (
        <Modal title="Add I-Note" onClose={() => setManipulate(false)}>
          <Manipulate onClose={() => setManipulate(false)} />
        </Modal>
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
