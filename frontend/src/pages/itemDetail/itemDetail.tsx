import { useState, useCallback,useMemo } from "react";
import { DataTable } from "../../component/DataTable/DataTable"; 
import {
  useGetAllItemDetailsQuery,
  useUpdateItemDetailMutation,
  useDeleteItemDetailMutation,
  useAddItemDetailMutation,
} from "../../store/services/item-details";
import styles from "./ItemDetail.module.css";
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


export type FormData =  {
  id: number;
  IndentNo?: string;
  VendorCode?: string;
  OrderDate?: string;  
  OrderLineNo?: number;
  ItemCode?: string;
  SectionHead?: string;
  ItemDesc?: string;
  CountryCode?: string;
  ItemDeno?: string;  
  MonthsShelfLife?: number;
  CRPCategory?: string;   
  VEDCCategory?: string; 
  ABCCategory?: string;  
  DateTimeApproved?: string ;  
  ApprovedBy?: string;
  ReviewSubSectionCode?: string;
  INCATYN?: string;  
};


const itemSchema = yup.object({
  IndentNo: yup.string().optional(),
  VendorCode: yup.string().optional(),
  OrderDate: yup.string().optional(),
  OrderLineNo: yup.number().optional(),
  ItemCode: yup.string().optional(),
  SectionHead: yup.string().optional(),
  CountryCode: yup.string().optional(),
  ItemDesc: yup.string().optional(),
  ItemDeno: yup.string().optional(),
  MonthsShelfLife: yup.number().optional(),
  CRPCategory: yup.string().optional(),
  VEDCCategory: yup.string().optional(),
  ABCCategory: yup.string().optional(),
  DateTimeApproved: yup.string().optional(),
  ApprovedBy: yup.string().optional(),
  ReviewSubSectionCode: yup.string().optional(),
  INCATYN: yup.string().optional(),
})

export type EditableFormData = Omit<FormData, 'id'>;


const itemField : FieldConfig<EditableFormData>[]=[
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
    name:"OrderLineNo",
    label:"Order Line No",
    type:"input",
    required:false
  },
  {
    name:"ItemCode",
    label:"Item Code",
    type:"input",
    required:false
  },
  {
    name:"SectionHead",
    label:"Section Head",
    type:"input",
    required:false
  },
  {
    name:"ItemDesc",
    label:"Item Description",
    type:"input",
    required:false
  },
  {
    name:"CountryCode",
    label:"Country Code",
    type:"input",
    required:false
  },
  {
    name:"ItemDeno",
    label:"Item Deno",
    type:"input",
    required:false
  },
  {
    name:"MonthsShelfLife",
    label:"Months Shelf Life",
    type:"input",
    required:false
  },
  {
    name:"CRPCategory",
    label:"CRP Category",
    type:"input",
    required:false
  },
  {
    name:"VEDCCategory",
    label:"VEDC Category",
    type:"input",
    required:false
  },
  {
    name:"ABCCategory",
    label:"ABC Category",
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
    name:"ReviewSubSectionCode",
    label:"Review Sub Section Code",
    type:"input",
    required:false
  },
  {
    name:"INCATYN",
    label:"INCATYN",
    type:"input",
    required:false
  }
]
const ItemDetail = () => {
  
  const [page, setPage] = useState<number>(1);
  const limit = 50;
  const [search, setSearch] = useState<string | undefined>(undefined);

  const {data, isLoading, isError,error, refetch} = useGetAllItemDetailsQuery(
  { page, limit ,search},
  {
    refetchOnMountOrArgChange: true,
  }
);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [editingForm, setEditingForm] = useState<EditableFormData | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FormData | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const [updateItem] = useUpdateItemDetailMutation();
  const [deleteItem] = useDeleteItemDetailMutation(); 
  const[addItem] = useAddItemDetailMutation();

  // const [file, setFile] = useState<File | null>(null);

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
  // --------------------------


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


  const handleSaveEdit = async (updated: EditableFormData) => {
    if(!editingId){
      return
    }
    try {
      await updateItem({
         id: editingId, 
         data: updated 
        }).unwrap();
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
    setLoadingAction(deleteTarget.id.toString());
    await deleteItem(deleteTarget.id).unwrap();
    toast.success("Deleted successfully");
    setLoadingAction(null)
    setDeleteTarget(null)
    refetch();
  } catch (err: unknown) {
    if(err instanceof Error){
      console.error(err.message);
      toast.error(err.message);
    }else{
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
    component: (row: FormData) => ( 
      <button
        className={`${styles.iconBtn} ${styles.edit}`}
        title="Edit Item"
        onClick={() => {
          setEditingId(row.id);
          setEditingForm({
            IndentNo: row.IndentNo,
            VendorCode: row.VendorCode,
            OrderDate: row.OrderDate,
            OrderLineNo: row.OrderLineNo,
            ItemCode: row.ItemCode,
            SectionHead: row.SectionHead,
            ItemDesc: row.ItemDesc,
            CountryCode: row.CountryCode,
            ItemDeno: row.ItemDeno,
            MonthsShelfLife: row.MonthsShelfLife,
            CRPCategory: row.CRPCategory,
            VEDCCategory: row.VEDCCategory,
            ABCCategory: row.ABCCategory,
            DateTimeApproved: row.DateTimeApproved,
            ApprovedBy: row.ApprovedBy,
            ReviewSubSectionCode: row.ReviewSubSectionCode,
            INCATYN: row.INCATYN,
          });
        }}
      >
        <FiEdit size={18} />
      </button>
    ),
  },
  {
    label: "Delete",
    onClick: () => {}, // FIXED: Changed 'onclick' to 'onClick'
    component: (row: FormData) => (
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
            { label: "Indent No", accessor: "IndentNo" },
            { label: "Vendor Code", accessor: "VendorCode" },
            { label: "Order Date", accessor: "OrderDate" },
            { label: "Order Line No", accessor: "OrderLineNo" },
            { label: "Item Code", accessor: "ItemCode" },
            { label: "Section Head", accessor: "SectionHead" },
            { label: "Item Description", accessor: "ItemDesc" },
            { label: "Country", accessor: "CountryCode" },
            { label: "Item Deno", accessor: "ItemDeno" }, 
            { label: "Month Shelf Life", accessor: "MonthsShelfLife" },
            { label: "CRP Category", accessor: "CRPCategory" },
            { label: "VEDC Category", accessor: "VEDCCategory" },
            { label: "ABC Category", accessor: "ABCCategory" },
            {label:"DateTimeApproved", accessor:"DateTimeApproved"},
            {label:"ApprovedBy", accessor:"ApprovedBy"},
            {label:"ReviewSubSectionCode", accessor:"ReviewSubSectionCode"},
            {label:"INCATYN", accessor:"INCATYN"},
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
      {isError && (
          <p className={styles.errorMsg}>
             {"message" in error ? error.message : "Failed to load users"}
          </p>
      )}

      {/* Title */}
      <h1 className={styles.pageTitle}>Item Details</h1>

      {/* Data Table */}
       <div className={styles.tableWrapper}>
        <DataTable
          fetchData={fetchData}
          loading={isLoading}
          isSearch={true}
          isExport={true}
          isNavigate={true}   
          columns={columns}
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
          fields={itemField}
          schema={itemSchema}
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
            OrderLineNo: 0,
            ItemCode: "",
            SectionHead: "",
            ItemDesc: "",
            CountryCode:"",
            ItemDeno:"",
            MonthsShelfLife:0,
            CRPCategory:"",
            VEDCCategory:"",
            ABCCategory:"",
            DateTimeApproved:"",
            ApprovedBy:"",
            ReviewSubSectionCode:"",
            INCATYN: "",
          }}
          fields={itemField}
          schema={itemSchema}
          onClose={() => setAddModal(false)}
          onSave={handleAdd}
        />
      )}

     
    </div>
  );
};

export default ItemDetail;
