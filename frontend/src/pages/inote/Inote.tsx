import { useMemo, useCallback, useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
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

const removeHtmlTags = (html: string | null | undefined): string => {
  if (!html) return "N/A";
  
  // 1. Swap <br> for a comma so words don't squash together
  const preparedHtml = html.replace(/<br\s*\/?>/gi, ", ");
  
  // 2. Your Senior's exact DOMParser logic
  const parser = new DOMParser();
  const doc = parser.parseFromString(preparedHtml, "text/html");
  const plainText = doc.body.textContent || "";
  
  // Clean up any double commas and return
  return plainText.replace(/,\s*,/g, ",").trim();
};

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

const formatDate = (dateStr: string): string => {
  if (dateStr.includes(" to ")) {
    const parts = dateStr.split(" to ");
    return `${formatSingleDate(parts[0])} to ${formatSingleDate(parts[1])}`;
  }
  return formatSingleDate(dateStr);
};

const formatSingleDate = (dateStr: string): string => {
  let date: Date;

  if (dateStr.includes("-") && dateStr.split("-")[0].length === 2) {
    const [d, m, y] = dateStr.split("-");
    date = new Date(`${y}-${m}-${d}`);
  } else {
    date = new Date(dateStr);
  }

  if (isNaN(date.getTime())) return dateStr; 

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(date)
    .replace(/ /g, "-");
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

  const modalContentRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  const [save] = usePostFinalMutation();
  const [update] = useUpdateFinalPageMutation();
  const [deleteFinalPage] = useDeleteFinalPageMutation();

  const [editingForm, setEditingForm] = useState<final | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<final | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [addModal, setAddModal] = useState<boolean>(false);
  const [showEditor, setShowEditor] = useState<boolean>(false);

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditorForm>({
    defaultValues: {
      editorContent: "",
    },
    mode: "onChange", 
    reValidateMode: "onChange",
  });

  useEffect(() => {
    if (showEditor && stepperData && !editingForm && isInitialMount.current) {
      const readyHtml = processTemplate(stepperData.content, stepperData);
      setValue("editorContent", readyHtml, {
        shouldValidate: false,
        shouldDirty: false,
        shouldTouch: false,
      });
      isInitialMount.current = false;
    }
  }, [showEditor, stepperData, editingForm, setValue]);

  useEffect(() => {
    if (!showEditor) {
      isInitialMount.current = true;
    }
  }, [showEditor]);

  const processTemplate = (html: string, state: StepperState) => {
    if (!html) return "";

    const moAddress = state.info?.mo[0]?.MoAddress;

    // Financial Year Logic
    const now = new Date();
    const year = now.getFullYear();
    const financialYear = now.getMonth() >= 3 ? `${year}` : `${year - 1}`;

    
     const table = [
      `<table>
    <thead>
      <tr> 
        <td>Item No<br> A/T <br>(OL No)</td>
        <td colspan="2"><u>Description of store</u><br/>Total Quantity Ordered.<br/>The Inspector should indicate whether the<br/>supply has been made in seller's / buyer's<br> container's, where stores are required in the <br> supplied in containers</td>
        <td>Acc<br>Unit</td>
        <td>Tendered<br>Quantity</td>
        <td>Accepted<br>Quantity</td>
        <td>Brought to <br>account in <br>ledger folio <br>Total Qty <br>Accepted to <br>Date</td>
        <td>Rejected <br>Quantity</td>
        <td >No and <br>date of inspection <br>certificate <br>(if any)<br> issued by <br>DGISAM or<br> other Isp.<br> Authority</td>
        <td>Remarks</td>
      </tr>
    </thead>`,
      ...(state?.products?.map(
        (p: PoDetailItem & itemDetail & { acceptedQty: number }, index: number) => {
          const itemDesc = p.ItemDesc || "";
          const itemDeno = p.ItemDeno || "";
          const acceptedQty = p.acceptedQty || p.Qty || 0;

          const qty = p.Qty || 0;
          const qtyFullFill = p.QtyFullFill || 0;
          // Check if this is the very first row
    const isFirstRow = index === 0;
    // Calculate how many rows this last cell needs to cover
    const totalRows = state.products?.length || 0;
      /* ... inside your map function ... */
      return `<tr>
          <td >${p.OrderLineNo}</td>
          <td >${p.ItemCode}<br/>${itemDesc}</td>
          <td >Qty ${qty}</td>
          <td >${itemDeno}</td>
          <td >${qty - qtyFullFill}</td>
          <td >${acceptedQty - qtyFullFill}</td>
          <td >${acceptedQty === qty && qtyFullFill === 0 ? acceptedQty : acceptedQty + " / " + qty}</td>
          <td >0</td>
          ${isFirstRow ? `
          <td rowspan="${totalRows}" colspan="2" style="vertical-align: top; text-align: left; padding: 8px; border: 1px solid black;">
            ${ ""}
          </td>` : ``}
      </tr>`;
        },
      ) || []),
      "</table>",
    ].join("");

    const replacements: Record<string, string> = {
      "{{FINANCIAL_YEAR}}": financialYear,
      "{{INDENT_NO}}": state.user.IndentNo || "N/A",
      "{{CURRENT_DATE}}": new Date()
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
        .replace(/ /g, "-"),

      "{{ORDER_DATE}}":
        new Date(state.user.OrderDate)
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
          .replace(/ /g, "-") || "N/A",
      "{{CONSIGNEE_CODE}}":
        extractFromParens(state.indentInfo.details[0]?.ConsigneeCode) ||
        "" ||
        "N/A",
      "{{INDENT_DATE}}": formatDate(state.user.date) || "N/A",
      "{{INSPECTION_EVAL_RANGE}}":
        formatDate(state.user.InspectionOfferedDate) || "N/A",
      "{{INSPECTION_DATE}}": formatDate(state.user.InspectedOn) || "N/A",
      "{{TOTAL_ITEMS}}": state?.products?.length.toString() || "0",
      "{{VENDOR_NAME}}": state.info?.vendor[0]?.FirmName || "N/A",
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

    const rawAddress = state.info?.vendor[0]?.FirmAddress || "N/A";
    
    const cleanedForMultiLine = rawAddress
      .replace(/<\/?p[^>]*>/gi, "") 
      .replace(/(<br\s*\/?>\s*){2,}/gi, "<br>"); 

    const multiLineAddress = `
      <span id="vendorBlock">
        ${cleanedForMultiLine}
      </span>`;
      
    const singleLineAddress = `
      <span class="vendorBlockSingle">
        ${removeHtmlTags(rawAddress)}
      </span>`;

    let vendorCount = 0;
    
    updatedHtml = updatedHtml.replace(/\{\{VENDOR_DETAILS\}\}/g, () => {
      vendorCount++;
      if (vendorCount === 1) {
        return multiLineAddress;  
      } else {
        return singleLineAddress; 
      }
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
      onClick: () => {},
      component: (row: final) => (
        <button
          className={`${styles.iconBtn} ${styles.edit}`}
          title="Edit User"
          onClick={() => {
            setEditingForm(row);
            setShowEditor(true);
            setTimeout(() => {
              setValue("editorContent", row.content, {
                shouldValidate: false,
                shouldDirty: false,
              });
            }, 0);
          }}
        >
          <FiEdit size={18} />
        </button>
      ),
    },
    {
      label: "Delete",
      onClick: () => {},
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
      onClick: () => {},
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

    updatedContent = updatedContent.replace(
      /<strong>INSPECTION NOTE NO\.[^<]*<\/strong>/g,
      (match) =>
        `<strong><span class="underline-IN">${match.replace(/<\/?strong>/g, "")}</span></strong>`,
    );

    const processedContent = updatedContent
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

        /* Make all tables in bullet 9 wider and left-aligned */
          ol > li:nth-of-type(9) figure.table table,
          ol > li:nth-of-type(9) figure.table table{
              width: 108% !important;   /* expand left */
              transform: translateX(-6.5%) !important; 
              // margin-left: -4% !important;
              table-layout: auto !important;
          }

         ol > li:nth-of-type(9) figure.table:nth-of-type(1) table,
        ol > li:nth-of-type(9) figure.table:nth-of-type(2) table {
              display: block;
              border-collapse: collapse !important;

              /* Remove all normal borders */
              border: none !important;

              /* Add only TOP + BOTTOM border */
              border-top: 1px solid black !important;
              border-bottom: 1px solid black !important;

              margin: 0 !important;
              padding: 0 !important;
          }

          /* Remove ALL cell borders */
          ol > li:nth-of-type(9) figure.table:nth-of-type(1) table td,
          ol > li:nth-of-type(9) figure.table:nth-of-type(1) table th,
          ol > li:nth-of-type(9) figure.table:nth-of-type(2) table td,
          ol > li:nth-of-type(9) figure.table:nth-of-type(2) table th {
              border: none !important;       
              padding: 3pt !important;
              line-height: 1.2 !important;
              word-break: break-word !important;
              text-align: center !important;
              font-size: 7.8pt !important;
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

          
          /* Font size 8pt ONLY for the 3rd table inside point 9 */
          ol > li:nth-of-type(9) figure.table:nth-of-type(3) table,
          ol > li:nth-of-type(9) figure.table:nth-of-type(3) table td,
          ol > li:nth-of-type(9) figure.table:nth-of-type(3) table th {
              font-size: 8pt !important;
          }
          /* Apply 6pt to ONLY the Hindi text inside 9th point → 3rd table */
          ol > li:nth-of-type(9) figure.table:nth-of-type(3) table .hindi-text {
              font-size: 10pt !important;
          }

          /* Remove border ONLY from the LAST table inside LIST ITEM 9 */
          ol > li:nth-of-type(9) figure.table:last-of-type table,
          ol > li:nth-of-type(9) figure.table:last-of-type table td,
          ol > li:nth-of-type(9) figure.table:last-of-type table th {
              border: none !important;
              font-size: 10.5pt !important;
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
 

 

        /* Target the very last table container in the PDF */

   
figure.table:nth-of-type(5) table {
    width: 100% !important;
    border-collapse: collapse !important;
    font-size: 7.5pt !important; /* Fixed small font size */
    table-layout: auto !important;
}

/* 1. Header Styling: No bold, Centered */
figure.table:nth-of-type(5)  thead  th,
figure.table:nth-of-type(5)  thead  td {
    font-weight: normal !important;
    text-align: center !important;
    vertical-align: top !important;
    padding: 1px !important;
    border: 1px solid black !important;
     word-break: break-word !important;
    overflow-wrap: break-word !important;
    white-space: normal !important;
}

/* 2. Data Cell Styling */
figure.table:nth-of-type(5) tbody  td {
    padding: 4px !important;
     word-break: break-word !important;
    overflow-wrap: break-word !important;
    white-space: normal !important;
}


/* 1. Item No (Very narrow) */
figure.table:nth-of-type(5) thead  th:nth-child(1) { width: 4% !important; }

/* 2 & 3. Description Area (The "Wide" columns) */
figure.table:nth-of-type(5) thead th:nth-child(2) { width: 36% !important; } 

/* 4-10. Numerical Columns (Keep these small) */
figure.table:nth-of-type(5) thead th:nth-child(3) { width: 8% !important; }
figure.table:nth-of-type(5) thead th:nth-child(4) { width: 8% !important; } 
figure.table:nth-of-type(5) thead th:nth-child(5) { width: 8% !important; }  
figure.table:nth-of-type(5) thead th:nth-child(6) { 
  width: 8% !important; 
  // text-align: left !important; 
  padding-left:4px !important
  }  
figure.table:nth-of-type(5) thead th:nth-child(7) { width: 10% !important; }  
figure.table:nth-of-type(5) thead th:nth-child(8) { width: 8% !important; }  
figure.table:nth-of-type(5) thead th:nth-child(9) { width: 9% !important; }  
figure.table:nth-of-type(5) thead th:nth-child(10) { width: 9% !important; } 




/* 1. Item No */
figure.table:nth-of-type(5)tbody td:nth-child(1) { 
    // width: 4% !important;  
    text-align: center !important;
    vertical-align: top !important;}

/* 2 & 3. Description (80/20 Partition) */
/* Left Side: Item Details (Larger) */
figure.table:nth-of-type(5)tbody td:nth-child(2) { 
  padding: 20px !important;
    width: 28.8% !important;
    text-align: left !important;
    padding: 4px !important;
}

/* Right Side: Quantity (Smaller) */
figure.table:nth-of-type(5) tbody td:nth-child(3) { 
    width: 7.2% !important;
    text-align: right !important;
    vertical-align: top !important;
    padding: 4px !important;

}

/* 4-8. Numerical Data (Lock these small) */
figure.table:nth-of-type(5) tbody td:nth-child(4) { width: 7.5% !important;  text-align: center !important;
    vertical-align: top !important;}
figure.table:nth-of-type(5) tbody td:nth-child(5) { width: 7.5% !important;  text-align: center !important;
    vertical-align: top !important;}
figure.table:nth-of-type(5) tbody td:nth-child(6) { width: 7.5% !important;  text-align: center !important;
    vertical-align: top !important;}
figure.table:nth-of-type(5) tbody td:nth-child(7) { width: 10% !important; text-align: center !important;
    vertical-align: top !important; }
figure.table:nth-of-type(5) tbody td:nth-child(8) { width: 7.5% !important;  text-align: center !important;
    vertical-align: top !important;}

/* 9. The Merged Remarks/Cert Column */
figure.table:nth-of-type(5) tbody td:nth-child(9) { 
    width: 5% !important;
    max-width: 5% !important; 
    vertical-align: middle !important; 
     text-align: center !important;
    //  font-style: italic !important;
    
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
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 100);
      }
    };
  };

  const onFinalSubmit = async (formData: EditorForm) => {
    const body = {
      content: formData.editorContent,
      i_note: stepperData?.info?.iNote?.iNote,
      indent_no: stepperData?.user?.IndentNo,
      id: undefined as number | undefined,
    };

    if (stepperData && !editingForm) {
      body.i_note = stepperData.info?.iNote?.iNote || 0;
      body.indent_no = stepperData.user?.IndentNo || "";
    } else if (editingForm) {
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
          reset({ editorContent: "" });
        }
      } else {
        const res = await save(body).unwrap();

        if (res?.data) {
          toast.success("Saved Successfully");
          refetch(); 
          setShowEditor(false);
          setEditingForm(null); 
          setStepperData(null); 
          reset({ editorContent: "" });
        }
      }
    } catch (error) {
      console.error("Save failed", error);
      toast.error("Failed to save I-Note");
    }
  };

  const [manipulate, setManipulate] = useState<boolean>(false);

  const handleEditorClose = useCallback(() => {
    setShowEditor(false);
    setEditingForm(null);
    setStepperData(null);
    reset({ editorContent: "" });
  }, [reset]);

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

      {showEditor && (
        <Modal
          key={editingForm ? `edit-${editingForm.id}` : "new"}
          title={editingForm ? "Edit I-Note" : "Add I-Note"}
          size="xl"
          onClose={handleEditorClose}
        >
          {" "}
          <div ref={modalContentRef} className={styles.modalContent}>
            <form
              onSubmit={handleSubmit(onFinalSubmit)}
              className={
                editingForm ? styles.modalEditorWrapper : styles.editorWrapper
              }
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
                  label={editingForm ? "Update I-Note" : "Save Final I-Note"}
                  type="submit"
                  buttonType="three"
                />

                {!editingForm && (
                  <Button
                    label="Print"
                    onClick={() => handlePrint(watch("editorContent"))}
                    buttonType="two"
                  />
                )}

                {editingForm && (
                  <Button
                    label="Cancel"
                    buttonType="two"
                    onClick={() => {
                      setEditingForm(null);
                      setShowEditor(false);
                    }}
                  />
                )}
              </div>
            </form>
          </div>
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