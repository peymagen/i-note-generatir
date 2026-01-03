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


type FormValue = string | number | null | undefined;

type BaseFormData = Record<string, FormValue>;

type FormData = BaseFormData & {
  id: number;
};



interface ModalProps {
  title: string;
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  onClose: () => void;
  onSave: (formData: FormData) => void;
}
const Modal: React.FC<ModalProps> = ({ title, form: initialForm, onClose, onSave }) => {
  const { register, handleSubmit, formState: { errors },reset } = useForm({
    defaultValues: initialForm
  });
useEffect(() => {
    reset(initialForm);
  }, [initialForm]);
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
  const { data, isLoading, isError, refetch } = useGetAllItemDetailsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  
const [form, setForm] = useState<FormData>({
  id: 0,
  IndentNo: "",
  VendorCode: "",
  OrderDate: "",
  ItemDesc: "",
  OrderLineNo: "",
  ItemCode: "",
  SectionHead: "",
  DescriptionL: "",
  CountryCode: "",
  ItemDeno: "",
  MonthsShelfLife: "",
  CRPCategory: "",
  VEDCCategory: "",
  ABCCategory: "",
});
const [editingRow, setEditingRow] = useState<FormData | null>(null);
  const [editForm, setEditForm] = useState<FormData>({id: 0});
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

  // Backend nested response => actual items
  const items = useMemo(() => data?.data?.data ?? [], [data?.data?.data]);
 
  // --------------------------                
  // FETCH DATA FOR DataTable (DataTable handles pagination!)
  // --------------------------
  const fetchData = useCallback(
    async (params?: { page: number; search?: string }) => {
      const page = params?.page ?? 1;
      const search = params?.search?.toLowerCase() ?? "";

      const pageSize = 100; // rows per page

      // Filter by search
      let filtered = items;
      if (search) {
        filtered = items.filter((item: FormData) =>
          Object.values(item).some((v) =>
            String(v).toLowerCase().includes(search)
          )
        );
      }

      // Slice according to page
      const start = (page - 1) * pageSize;
      const end = start + pageSize;

      return {
        data: filtered.slice(start, end),
        total: filtered.length,
      };
    },
    [items]
  );

  // --------------------------
  // EDIT SAVE HANDLER
  // --------------------------
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

  // --------------------------
  // IMPORT EXCEL HANDLER
  // --------------------------
//  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//   const selectedFile = e.target.files?.[0];

//   if (!selectedFile) return;

//   setFile(selectedFile);

//   try {
//     await importExcel(selectedFile).unwrap();
//     toast.success("Excel imported successfully!");
//     refetch();
//   } catch (err) {
//     toast.error("Failed to import Excel!");
//   }
// };

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
        {/* <input
          type="file"
          id="excel-upload"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <Button
          label="Import"
          buttonType="three"
          onClick={() => document.getElementById('excel-upload')?.click()}
          loading={false}
        /> */}

      </div>

      {/* Title */}
      <h1 className={styles.pageTitle}>Item Details</h1>

      {/* Data Table */}
       <div className={styles.tableWrapper}>
        <DataTable
          fetchData={fetchData}
          loading={isLoading}
          isSearch={true}
          // addButton={{
          //   label: "Add Item",
          //   buttonType: "one",
          //   onClick: () => {console.log("clicked")
          //     setAddModal(true)},
          // }}

          isExport={true}
          isNavigate={true}   // IMPORTANT → enables built-in pagination UI!
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
