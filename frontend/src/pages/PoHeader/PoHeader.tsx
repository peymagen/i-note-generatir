import  { useState, useCallback, useMemo } from "react";
import { DataTable } from "../../component/DataTable/DataTable"; 
import {
  useGetAllPOHeaderQuery,
  useUpdatePOHeaderMutation,
  useAddPoHeaderMutation,
  useDeletePoHeaderMutation
} from "../../store/services/po-header";
import styles from "./PoHeader.module.css";
import { toast } from "react-toastify";
import Button from "../../component/Button/Button"; 
import * as yup from "yup";
import type { FieldConfig } from "../../component/Model2/Model";
import Modal from "../../component/Model2/Model";
import ConfirmDialog from "../../component/ConfirmDialoge";
import {
  FiEdit,
  FiTrash2,
} from "react-icons/fi";


export type PoHeaderData =  {
  id: number;
  IndentNo?: string;
    VendorCode?: string;
    OrderDate?: string; 
    ValueRs?: string;
    InspectingAgencyType?: string;
    InspectorCode?: string;
    InspectionSiteCode?: string;
    Remarks?: string;
    QuoteKey?: number;  
    SelectedQuoteDate?: string;
    DateTimeApproved?: string ; 
    ApprovedBy?: string; 
    TypeClosing?: string;  
    DateCloded?: string ;  
    ClosedBy?: string ; 
    PackingInstruction?:string;
    DespatchInstruction?:string;
    InspectionInstruction?:string;
    StationCode?:string;
    Remarks1?:string;
    Name?:string;
    City?:string;
    State?:string;
};

const poHeaderSchema = yup.object({
  IndentNo: yup.string().optional(),
  VendorCode: yup.string().optional(),
  OrderDate: yup.string().optional(),
  ValueRs: yup.string().optional(),
  InspectingAgencyType: yup.string().optional(),
  InspectorCode: yup.string().optional(),
  InspectionSiteCode: yup.string().optional(),
  Remarks: yup.string().optional(),
  QuoteKey: yup.number().optional(),
  SelectedQuoteDate: yup.string().optional(),
  DateTimeApproved: yup.string().optional(),
  ApprovedBy: yup.string().optional(),
  TypeClosing: yup.string().optional(),
  DateCloded: yup.string().optional(),
  ClosedBy: yup.string().optional(),
  PackingInstruction: yup.string().optional(),
  DespatchInstruction: yup.string().optional(),
  InspectionInstruction: yup.string().optional(),
  StationCode: yup.string().optional(),
  Remarks1: yup.string().optional(),
  Name: yup.string().optional(),
  City: yup.string().optional(),
  State: yup.string().optional(),
});

export type EditableFormData = Omit<PoHeaderData, 'id'>;

const poHeaderField : FieldConfig<EditableFormData>[]=[
  {
    name:"IndentNo",
    label:"Indent No",
    type:"input",
    required:false
  },
    {
    name:"VendorCode",
    label:"Vendor Code",
    type:"input",
    required:false
  },
    {
    name:"OrderDate",
    label:"Order Date",
    type:"input",
 required:false
  },

    {
    name:"ValueRs",
    label:"Value Rs",
    type:"input",
 required:false  },
    {
    name:"InspectingAgencyType",
    label:"Inspecting Agency Type",
    type:"input",
    required:false
  },
    {
    name:"InspectorCode",
    label:"Inspector Code",
    type:"input",
    required:false
  },
    {
    name:"InspectionSiteCode",
    label:"Inspection Site Code",
    type:"input",
    required:false
  },
    {
    name:"Remarks",
    label:"Remarks",
    type:"input",
    required:false
  },

    {
    name:"QuoteKey",
    label:"Quote Key",
    type:"input",
    required:false
  },
    {
    name:"SelectedQuoteDate",
    label:"Selected Quote Date",
    type:"input",
    required:false
  },
    {
    name:"DateTimeApproved",
    label:"Date Time Approved",
    type:"input",
    required:false
  },
    {
    name:"ApprovedBy",
    label:"Approved By",
    type:"input",
    required:false
  },
    {
    name:"TypeClosing",
    label:"Type Closing",
    type:"input",
    required:false
  },
    {
    name:"DateCloded",
    label:"Date Cloded",
    type:"input",
    required:false
  },
    {
    name:"ClosedBy",
    label:"Closed By",
    type:"input",
    required:false
  },
    {
    name:"PackingInstruction",
    label:"Packing Instruction",
    type:"input",
    required:false
  },
    {
    name:"DespatchInstruction",
    label:"Despatch Instruction",
    type:"input",
    required:false
  },
    {
    name:"InspectionInstruction",
    label:"Inspection Instruction",
    type:"input",
    required:false
  },
    {
    name:"StationCode",
    label:"Station Code",
    type:"input",
    required:false
  },
    {
    name:"Remarks1",
    label:"Remarks1",
    type:"input",
    required:false
  },
    {
    name:"Name",
    label:"Name",
    type:"input",
    required:false
  },
    {
    name:"City",
    label:"City",
    type:"input",
    required:false
  },
  {
    name:"State",
    label:"State",
    type:"input",
    required:false
  }

]

const PoDetail = () => {

    const [page, setPage] = useState<number | undefined>(undefined);
    const limit = 50;
    const [search, setSearch] = useState<string | undefined>(undefined);
  
    const {data, isLoading, isError, error, refetch} = useGetAllPOHeaderQuery(
    { page, limit ,search},
    {
      refetchOnMountOrArgChange: true,
    }
  );
  const [editingId, setEditingId] = useState<number | null>(null);

  const [editingForm, setEditingForm] = useState<EditableFormData | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PoHeaderData | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);


  // const [importExcel] = useImportPOHeaderMutation();
  const [updateItem] = useUpdatePOHeaderMutation();
  const [deleteItem] = useDeletePoHeaderMutation(); 
  const[addItem] = useAddPoHeaderMutation();


  // const [file, setFile] = useState<File | null>(null);

  // Backend nested response => actual items
  // const items = data?.data?.data ?? [];
  const items = useMemo(() => data?.data?.data ?? [], [data?.data?.data]);
  const pagination = data?.data?.pagination;
 const totalRecords = data?.data?.pagination?.totalRecords ?? 0;
  const totalPages = pagination?.totalPages ?? 1;

  console.log("Items:", items);
  console.log("Pagination:", pagination);
  console.log("Total Records:", totalRecords);
  console.log("Total Pages:", totalPages)
 
  // --------------------------                
  // FETCH DATA FOR DataTable (DataTable handles pagination!)
  // --------- -----------------
  const fetchData = useCallback(
      async (params?: { page?: number; search?: string }) => {
        if (params?.search !== undefined && params.search !== search) {
          setSearch(params.search);
          setPage(1);
        }
  
        if (params?.page && params.page !== page) {
          setPage(params.page);
        }
  
        return {
          data: items,
          total: totalRecords,
        };
      },
      [items, totalRecords, page, search]
    );


  // --------------------------
  // EDIT SAVE HANDLER
  // --------------------------
  const handleSaveEdit = async (updated: EditableFormData) => {
    if(!editingId){
          return
        }
    try {
      await updateItem({ id: editingId, data: updated }).unwrap();
      toast.success("Updated successfully");
      setEditingId(null);
      setEditingForm(null)
      refetch();
    } catch (err: unknown) {
      if(err instanceof Error){
        console.error(err.message);
        toast.error(err.message);
      }else{
        console.error(err);
        toast.error("Update failed");
      }
    }
  };

const handleDelete = async () => {
  if(!deleteTarget?.id){
      toast.error("Invalid error")
      return
    }
  try {
   
    const id = Number(deleteTarget.id);
    await deleteItem(id).unwrap();
    toast.success("Deleted successfully");
    setLoadingAction(null)
    setDeleteTarget(null)
    refetch();
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
      toast.error(err.message);
    } else {
      console.error(err);
      toast.error("Delete failed");
    }
  }
};

const handleAdd = async (data: EditableFormData) => {
  try {
    await addItem(data).unwrap();
    toast.success("Item Added Successfully");
    setAddModal(false);
    refetch();
  } catch (err: unknown) {
    if(err instanceof Error){
      console.error(err.message);
      toast.error(err.message);
    }else{
      console.error(err);
      toast.error("Add failed");
    }
    
  }
};


  const actions = [
    {
      label: "Edit",
      onClick: () => {},
      // Use FormData here so it matches what the DataTable expects
      component: (row: PoHeaderData) => ( 
        <button
          className={`${styles.iconBtn} ${styles.edit}`}
          title="Edit Item"
          onClick={() => {
            console.log("PPPPPP",row)
            setEditingId(row.id);
            setEditingForm({
              IndentNo: row.IndentNo,
              VendorCode: row.VendorCode,
              OrderDate: row.OrderDate,
              ValueRs: row.ValueRs,
              InspectingAgencyType: row.InspectingAgencyType,
              InspectionSiteCode: row.InspectionSiteCode,
              InspectorCode: row.InspectorCode,
              Remarks: row.Remarks,
              QuoteKey: row.QuoteKey,
              SelectedQuoteDate: row.SelectedQuoteDate,
              DateTimeApproved: row.DateTimeApproved,
              ApprovedBy: row.ApprovedBy,
              TypeClosing: row.TypeClosing,
              DateCloded: row.DateCloded,
              ClosedBy: row.ClosedBy,
              PackingInstruction: row.PackingInstruction,
              DespatchInstruction: row.DespatchInstruction,
              InspectionInstruction: row.InspectionInstruction,
              StationCode:row.StationCode,
              Remarks1:row.Remarks1,
              Name:row.Name,
              City:row.City,
              State:row.State
            });
          }}
        >
          <FiEdit size={18} />
        </button>
      ),
    },
    {
      label: "Delete",
      onClick: () => {}, 
      component: (row: PoHeaderData) => (
        <button
          className={`${styles.iconBtn} ${styles.delete}`}
          title="Delete"
          onClick={() => setDeleteTarget(row)}
        >
          <FiTrash2 size={18} />
        </button>
      ),
    },
  ];
  const columns = [
    { label: "ID", accessor: "id" },
            { label: "User ID", accessor: "userId" },
            { label: "Indent No", accessor: "IndentNo" },
            { label: "Vendor Code", accessor: "VendorCode" },
            { label: "Order Date", accessor: "OrderDate" },
            { label: "ValueRs", accessor: "ValueRs" },
            { label: "Inspecting Agency Type", accessor: "InspectingAgencyType" },
            { label:"InspectorCode", accessor:"InspectorCode"},
            { label: "InspectionSiteCode", accessor: "InspectionSiteCode" },
            { label: "Remarks", accessor: "Remarks" },
            { label: "QuoteKey", accessor: "QuoteKey" },
            { label: "SelectedQuote Date ", accessor: "SelectedQuoteDate" },
            { label: "DateTime Approved", accessor: "DateTimeApproved" },
            { label: "ApprovedBy", accessor: "ApprovedBy" },
            { label: "Type Closing", accessor: "TypeClosing" },
            { label: "Date Cloded", accessor: "DateCloded" },
            {label:"Packing Instruction",accessor:"PackingInstruction"},
            {label:"Despatch Instruction",accessor:"DespatchInstruction"},
            {label:"Inspection Instruction",accessor:"InspectionInstruction"},
            {label:"StationCode",accessor:"StationCode"},
            {label:"Remarks1",accessor:"Remarks1"},
            {label:"Name",accessor:"Name"},
            {label:"City",accessor:"City"},
            {label:"State",accessor:"State"}

  ]
  return (
    <div className={styles.container}>

      {/* Import Excel */}
      <div className={styles.btnWrapper}>
         <Button
            label="Add"
            buttonType= "three"
            onClick={() => {console.log("clicked")
            setAddModal(true)}}
          />

      </div>

      {/* Title */}
      <h1 className={styles.pageTitle}>PO Header</h1>
      {isError && (
                <p className={styles.errorMsg}>
                   {"message" in error ? error.message : "Failed to load users"}
                </p>
            )}

      {/* Data Table */}
       <div className={styles.tableWrapper}>
        <DataTable
          fetchData={fetchData}
          loading={isLoading}
          isSearch={true}
          isExport={true}
          isNavigate={true}  
          columns={columns}
          // actions={[
          //   {
          //     label: "Edit",
          //     onClick: (row) => setEditingRow(row),
          //   },
          //   {
          //     label: "Delete",
          //     onClick: handleDelete,
          //   },
            
             
          // ]}
          actions={actions}
        />
      </div>

      {deleteTarget && (
              <ConfirmDialog
                title="Delete Item"
                message={`Are you sure you want to delete ${deleteTarget.IndentNo}? This action cannot be undone.`}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                loading={loadingAction === deleteTarget.id?.toString()}
              />
            )}

      {/* Edit Modal */}
      {editingForm && (
          <Modal<EditableFormData>
                title="Edit Item"
                form={editingForm}
                fields={poHeaderField}
                schema={poHeaderSchema}
                onClose={() => {
                  setEditingId(null);
                  setEditingForm(null);
                }}
                onSave={handleSaveEdit}
           />
      )}

      {addModal && (
        <Modal<EditableFormData>
          title="Add New Item"
          form={{
                IndentNo: "",
                VendorCode: "",
                OrderDate: "", 
                ValueRs: "",
                InspectingAgencyType: "",
                InspectorCode: "",
                InspectionSiteCode: "", 
                Remarks: "",
                QuoteKey: 0,  
                SelectedQuoteDate: "",
                DateTimeApproved: "" , 
                ApprovedBy: "", 
                TypeClosing: "",  
                DateCloded: "" ,  
                ClosedBy: "" , 
                PackingInstruction:"",
                DespatchInstruction:"",
                InspectionInstruction:"",
                StationCode:"",
                Remarks1:"",
                Name:"",
                City:"",
                State:"",
          }}
          fields={poHeaderField}
          schema={poHeaderSchema}
          onClose={() => setAddModal(false)}
          onSave={handleAdd}
        />
      )}

     
    </div>
  );
};

export default PoDetail;
