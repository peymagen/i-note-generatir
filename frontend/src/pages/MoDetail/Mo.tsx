import React, { useState, useCallback,useEffect } from "react";
import { DataTable } from "../../component/DataTable/DataTable"; 
import {
    useGetAllMoDetailQuery,
  useImportMoDetailMutation,
  useUpdateMoDetailMutation,
  useAddMoDetailMutation,
  useDeleteMoDetailMutation
} from "../../store/services/mo-detail";
import styles from "./Mo.module.css";
import { toast } from "react-toastify";
import Button from "../../component/Button/Button";
import { RxCross2 } from "react-icons/rx";
import Input from "../../component/Input/Input2"; 
import { useForm } from "react-hook-form";


interface ModalProps {
  title: string;
  form: Record<string, any>;
  setForm: React.Dispatch<React.SetStateAction<Record<string, any>>>; // Add this line
  onClose: () => void;
  onSave: (formData: Record<string, any>) => void;
}

const Modal: React.FC<ModalProps> = ({ title, form: initialForm, onClose, onSave }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialForm
  });

  const onSubmit = (data: any) => {
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
const Mo = () => {
  const { data, isLoading, isError, refetch } = useGetAllMoDetailQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  
  const [form, setForm] = useState<Record<string, any>>({
        MOCPRO:"",
        MOAddress:"",
        
  });
const [editingRow, setEditingRow] = useState<any>(null);
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  useEffect(() => {
    if (editingRow) {
      setEditForm(editingRow);
    }
  }, [editingRow]);


  const [importExcel] = useImportMoDetailMutation();
  const [updateItem] = useUpdateMoDetailMutation();
  const [deleteItem] = useDeleteMoDetailMutation(); 
  const[addItem] = useAddMoDetailMutation();

  
  const [addModal, setAddModal] = useState(false);

  const [file, setFile] = useState<File | null>(null);

  // Backend nested response => actual items
  const items = data?.data?.data ?? [];
 
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
        filtered = items.filter((item: any) =>
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
  const handleSaveEdit = async (updated: any) => {
    try {
      await updateItem({ id: updated.id, data: updated }).unwrap();
      toast.success("Updated successfully");
      setEditingRow(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Update failed");
    }
  };

  // --------------------------
  // IMPORT EXCEL HANDLER
  // --------------------------
 const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const selectedFile = e.target.files?.[0];

  if (!selectedFile) return;

  setFile(selectedFile);

  try {
    await importExcel(selectedFile).unwrap();
    toast.success("Excel imported successfully!");
    refetch();
  } catch (err) {
    toast.error("Failed to import Excel!");
  }
};

const handleDelete = async (row: any) => {
  try {
    // Extract the ID from the row object
    const id = row.id || row.ID || row.Id; // Check common ID field names
    if (!id) {
      throw new Error('No ID found in row data');
    }
    await deleteItem(id).unwrap();
    toast.success("Deleted successfully");
    refetch();
  } catch (err: any) {
    toast.error(err?.data?.message || err.message || "Delete failed");
  }
};

const handleAdd = async (data: any) => {
  try {
    await addItem(data).unwrap();
    toast.success("Item Added Successfully");
    setAddModal(false);
    refetch();
  } catch (err: any) {
    toast.error(err?.data?.message || "Add failed");
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
        <input
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
        />

      </div>

      {/* Title */}
      <h1 className={styles.pageTitle}>PO Details</h1>

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
            { label: "MO Address", accessor: "MoAddress" },
            { label: "MO (MATERIAL ORGANISATION)/CPRO", accessor: "MoCPRO" },
            
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
            onClick: (row) => setEditingRow(row)

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

export default Mo;
