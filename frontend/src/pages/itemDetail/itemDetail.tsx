import React, { useState, useCallback,useEffect,useMemo } from "react";
import { DataTable } from "../../component/DataTable/DataTable"; 
import {
  useGetAllItemDetailsQuery,
  // useImportItemDetailsMutation,
  useUpdateItemDetailMutation,
  useDeleteItemDetailMutation,
  useAddItemDetailMutation,
} from "../../store/services/item-details";
import styles from "./ItemDetail.module.css";
import { toast } from "react-toastify";
import Button from "../../component/Button/Button";
import { RxCross2 } from "react-icons/rx";
import Input from "../../component/Input/Input2"; 
import { useForm } from "react-hook-form";




export type FormValue = string | number | null;

export type BaseFormData = Record<string, FormValue>;

export type FormData = BaseFormData & {
  id: number;
  IndentNo: string;
  VendorCode: string;
  OrderDate: string;  
  OrderLineNo: number;
  ItemCode: string;
  SectionHead: string;
  ItemDesc: string;
  CountryCode: string;
  ItemDeno: string;  
  MonthsShelfLife: number|null;
  CRPCategory: string;   
  VEDCCategory: string|null; 
  ABCCategory: string;  
  DateTimeApproved?: string | null;  
  ApprovedBy: string;
  ReviewSubSectionCode: string|null;
  INCATYN: string|null;  
};



interface ModalProps {
  title: string;
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  onClose: () => void;
  onSave: (formData: FormData) => void;
}
const Modal: React.FC<ModalProps> = ({ title, form: initialForm, onClose, onSave }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    defaultValues: initialForm
  });
  useEffect(() => {
    reset(initialForm);
  }, [initialForm, reset]);
  const onSubmit = (data: FormData) => {
    onSave(data);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{title}</h2>
          <RxCross2 className={styles.closeIcon} onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {Object.keys(initialForm).map((field) => (
            <Input
              key={field}
              label={field}
              name={field}
              register={register}
              errors={errors}
              fullWidth
            />
          ))}

          <div className={styles.modalActions}>
            <Button 
              type="button" 
              label="Cancel" 
              buttonType="three" 
              onClick={onClose} 
            />
            <Button 
              type="submit" 
              label="Save" 
              buttonType="one" 
            />
          </div>
        </form>
      </div>
    </div>
  );
};


// ------------------------------
// MAIN PAGE
// ------------------------------
const ItemDetail = () => {
  
  const [page, setPage] = useState<number>(1);
  const limit = 50;
  const [search, setSearch] = useState<string | undefined>(undefined);

  const {data, isLoading, isError, refetch} = useGetAllItemDetailsQuery(
  { page, limit ,search},
  {
    refetchOnMountOrArgChange: true,
  }
);



  
const [form, setForm] = useState<FormData>({
  id: 0,
  IndentNo: "",
  VendorCode: "",
  OrderDate: "",
  ItemDesc: "",
  OrderLineNo: 0,
  ItemCode: "",
  SectionHead: "",
  DescriptionL: "",
  CountryCode: "",
  ItemDeno: "",
  MonthsShelfLife: 0,
  CRPCategory: "",
  VEDCCategory: "",
  ABCCategory: "",
  DateTimeApproved: "",  
  ApprovedBy: "",
  ReviewSubSectionCode: "",
  INCATYN: "" 
});
const [editingRow, setEditingRow] = useState<FormData | null>(null);
  const [editForm, setEditForm] = useState<FormData>({
  id: 0,
  IndentNo: "",
  VendorCode: "",
  OrderDate: "",
  OrderLineNo: 0,
  ItemCode: "",
  SectionHead: "",
  ItemDesc: "",
  CountryCode: "",
  ItemDeno: "",
  MonthsShelfLife: 0,
  CRPCategory: "",
  VEDCCategory: "",
  ABCCategory: "",
  DateTimeApproved: null,
  ApprovedBy: "",
  ReviewSubSectionCode: "",
  INCATYN: ""
});
  useEffect(() => {
    if (editingRow) {
      setEditForm(editingRow);
    }
  }, [editingRow]);


  // const [importExcel] = useImportItemDetailsMutation();
  const [updateItem] = useUpdateItemDetailMutation();
  const [deleteItem] = useDeleteItemDetailMutation(); 
  const[addItem] = useAddItemDetailMutation();

  
  const [addModal, setAddModal] = useState(false);

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


  const handleSaveEdit = async (updated: FormData) => {
    try {
      await updateItem({ id: updated.id, data: updated }).unwrap();
      toast.success("Updated successfully");
      setEditingRow(null);
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


const handleDelete = async (row: FormData) => {
  try {
    // Extract the ID from the row object
    const id = Number(row.id || row.ID || row.Id); // Check common ID field names
    if (!id) {
      throw new Error('No ID found in row data');
    }
    await deleteItem(id).unwrap();
    toast.success("Deleted successfully");
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

const handleAdd = async (data: FormData) => {
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


  if (isLoading) return <div className={styles.loader}>Loading items...</div>;
  if (isError) return <div className={styles.error}>Error loading items</div>;

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
      <h1 className={styles.pageTitle}>Item Details</h1>

      {/* Data Table */}
       <div className={styles.tableWrapper}>
        <DataTable
          fetchData={fetchData}
          loading={isLoading}
          isSearch={true}
          isExport={true}
          isNavigate={true}   
          columns={[
            { label: "ID", accessor: "id" },
            { label: "User ID", accessor: "userId" },
            { label: "Indent No", accessor: "IndentNo" },
            { label: "Vendor Code", accessor: "VendorCode" },
            { label: "Order Date", accessor: "OrderDate" },
            { label: "Order Line No", accessor: "OrderLineNo" },
            { label: "Item Code", accessor: "ItemCode" },
            { label: "Section Head", accessor: "SectionHead" },
            { label: "Description", accessor: "ItemDesc" },
            { label: "Country", accessor: "CountryCode" },
            { label: "Item Deno", accessor: "ItemDeno" },
            { label: "Shelf Life", accessor: "MonthsShelfLife" },
            { label: "CRP Category", accessor: "CRPCategory" },
            { label: "VEDC Category", accessor: "VEDCCategory" },
            { label: "ABC Category", accessor: "ABCCategory" },
            {label:"DateTimeApproved", accessor:"DateTimeApproved"},
            {label:"ApprovedBy", accessor:"ApprovedBy"},
            {label:"ReviewSubSection", accessor:"ReviewSubSection"},
            {label:"INCATTYN", accessor:"INCATTYN"},
          ]}
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
          actions={[
          {
            label: "Edit",
            buttonType: "one",
            onClick: (row: FormData) => setEditingRow(row)

          },
          {
            label: "Delete",
            buttonType: "three",
            onClick: async (row) => {
              if (window.confirm('Are you sure you want to delete this item?')) {
                await handleDelete(row);
              }
            }
          }
        ]}
        />
      </div>

      {/* Edit Modal */}
      {editingRow && (
      <Modal
        title="Edit Item"
        form={editForm}
        setForm={setEditForm}
        onClose={() => setEditingRow(null)}
        onSave={handleSaveEdit}
      />
    )}


      {addModal && (
        <Modal
          title="Add New Item"
          form={form}
          setForm={setForm}
          onClose={() => setAddModal(false)}
          onSave={handleAdd}
        />
      )}

     
    </div>
  );
};

export default ItemDetail;
