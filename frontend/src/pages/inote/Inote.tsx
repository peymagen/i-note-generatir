import { useMemo, useCallback,useState } from "react";
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
import {useGetFinalQuery,
   usePostFinalMutation,
  useUpdateFinalPageMutation,
useDeleteFinalPageMutation
} from "../../store/services/final"

import {
  FiEdit,
  FiTrash2,
  FiPrinter,
} from "react-icons/fi";
import ConfirmDialog from "../../component/ConfirmDialoge";
import { DataTable } from "../../component/DataTable/DataTable";
import { toast } from "react-toastify";
import Manipulate from './Manipulate'

// Define a type for the editor form

type final = {
  id?: number; 
  content: string;
  i_note: number;
  indent_no?: string; 
};
interface EditorForm {
  editorContent: string;
  i_note?:number
}

const renderCleanAddress = (address: string | undefined) => {
  if (!address) return undefined;
    const key = "MATERIAL ORGANISATION";
    const startPos = address.indexOf(key);
    return startPos !== -1 ? address?.substring(startPos) : address;
  };

const Inote = () => {
  const [stepperData, setStepperData] = useState<StepperState | null>(null);
  const [page, setPage] = useState(1);
  const limit = 50;
  const [search, setSearch] = useState<string | undefined>(undefined);

  const { data, isLoading, isError, error,refetch } = useGetFinalQuery(
    { page, limit, search },
    { refetchOnMountOrArgChange: true }
  );
    console.log("isError:", isError, "error:", error);
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
      "{{VENDOR_DETAILS}}": state.info?.vendor[0]?.FirmAddress || "N/A" ,
      "{{MO_ADDRESS_WAREHOUSE}}":"THE CONTROLLERATE OF WAREHOUSING"+renderCleanAddress(state.info?.mo[0]?.MoAddress) || "N/A" ,
      "{{MO_ADDRESS_PROCUREMENT}}":"THE CONTROLLERATE OF PROCUREMENT"+renderCleanAddress(state.info?.mo[0]?.MoAddress) || "N/A" ,
      "{{FILE_NO}}": state.user.sequenceNo?.toString() || "N/A" ,
      "{{INOTE_NO}}":state.info?.iNote?.iNote?.toString() || "N/A" ,
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

    const items = useMemo(() => data?.data?.data ?? [], [data?.data?.data]);
    const totalRecords = data?.data?.pagination?.totalRecords ?? 0;
    console.log("items",items);
  
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
      [items, totalRecords, page, search]
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
    {label:"ID",accessor:"id"},
    {label:"I-Note",accessor:"i_note"},
    {label:"Indent No", accessor:"indent_No"},  
  ]
   const actions = [
      {
          label: "Edit",
          onClick: () => {},
  
          component: (row: final) => (
            <button
              className={`${styles.iconBtn} ${styles.edit}`}
              title="Edit User"
              onClick={()=>{setEditingForm(row)
                 setShowEditor(true)
                  setValue("editorContent", row.content);
                console.log("row:",row);
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
          className={`${styles.iconBtn} ${styles.edit}`} // Using same style class for consistency
          title="Print I-Note"
          onClick={() => handlePrint(row.content)}
        >
          <FiPrinter size={18} />
        </button>
      ),
    },
    ]
  const handleStepperComplete = (state: StepperState) => {
    setStepperData(state);
    const readyHtml = processTemplate(state.content, state);
    console.log("Processed HTML Content:", readyHtml);
    // 2. Set the processed HTML into the form state
    setValue("editorContent", readyHtml);

    setShowEditor(true);
    setAddModal(false);
  };

  const handlePrint = (constent:string) => {
    const content = constent;
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


  const onFinalSubmit = async (formData: EditorForm) => {
  // Initialize the payload
  let body = {
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

  console.log("Final Payload:", body);

  try {
    console.log("body",body)
    if(editingForm){
      const res = await update(body).unwrap();
      console.log("Update Response:", res);
      if (res?.data) {
        toast.success("Updated Successfully");
        refetch(); 
        setShowEditor(false);
        setEditingForm(null); 
        setStepperData(null); 
      }
    }
    else{
      const res = await save(body).unwrap();
      console.log("Save Response:", res); 
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

const [manipulate,setManipulate] = useState<boolean>(false);

  return (
    <div className={styles.container}>
      <div className={styles.btnWrapper}>
        <Button
          label="Add I-Note"
          buttonType="one"
          onClick={() => 
            
            setAddModal(true)}
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

      <h1 className={styles.pageTitle}>I-Note Management</h1>

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
          setShowEditor(false)}}
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
            <Button label="Save Final I-Note" type="submit" buttonType="one" />
            <Button 
              label="Print" 
              onClick={() => handlePrint(watch("editorContent"))} 
              buttonType="two" 
            />
          </div>
        </form>

      </Modal>
            )}
{/*${editingForm.i_note}` */}

    {(editingForm && showEditor) && (
        <Modal
        title="Edit I-Note"    
        size="xl" // Fixed typo from 'sixe' to 'size'
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

                <div className={styles.modalActions} style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                  <Button 
                    label="Update I-Note" 
                    type="submit" 
                    buttonType="one" 
                  />
                  <Button 
                    label="Cancel" 
                    buttonType="four" 
                    onClick={() => setEditingForm(null)} 
                  />
                </div>
              </form>
            </Modal>
          )}
    
            { manipulate && 
            <Modal
              title="Add I-Note"
              onClose={() => setManipulate(false)}
            >
              <Manipulate onClose={() => setAddModal(false)} />
            </Modal>

            }

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
