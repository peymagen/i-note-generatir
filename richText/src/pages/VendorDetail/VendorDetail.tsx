// import React, { useState, useCallback,useEffect } from "react";
// import { DataTable } from "../../component/DataTable/DataTable"; 
// import {
//   useGetAllVendorQuery,
//   useUpdateVendorMutation,
//   useDeleteVendorMutation,
//   useAddVendorMutation,
// } from "../../store/services/vendor-detail";
// import styles from "./VendorDetail.module.css";
// import { toast } from "react-toastify";
// import Button from "../../component/Button/Button";
// import { RxCross2 } from "react-icons/rx";
// import Input from "../../component/Input/Input2"; 
// import { useForm } from "react-hook-form";


 
// interface ModalProps { 
//   title: string;
//   form: Record<string, any>;
//   onClose: () => void;
//   onSave: (formData: Record<string, any>) => void;
// }

// const Modal: React.FC<ModalProps> = ({ title, form: initialForm, onClose, onSave }) => {
//   const { register, handleSubmit, formState: { errors } } = useForm({
//     defaultValues: initialForm
//   });

//   const onSubmit = (data: any) => {
//     onSave(data);
//   };

//   return (
//     <div className={styles.modalOverlay} onClick={onClose}>
//       <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
//         <div className={styles.modalHeader}>
//           <h2>{title}</h2>
//           <RxCross2 className={styles.closeIcon} onClick={onClose} />
//         </div>

//         <form onSubmit={handleSubmit(onSubmit)}>
//           {Object.keys(initialForm).map((field) => (
//             <Input
//               key={field}
//               label={field}
//               name={field}
//               register={register}
//               errors={errors}
//               fullWidth
//             />
//           ))}

//           <div className={styles.modalActions}>
//             <Button 
//               type="button" 
//               label="Cancel" 
//               buttonType="three" 
//               onClick={onClose} 
//             />
//             <Button 
//               type="submit" 
//               label="Save" 
//               buttonType="one" 
//             />
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };



// // ------------------------------
// // MAIN PAGE
// // ------------------------------
// const vendorDetail = () => {
//   const { data, isLoading, isError, refetch } = useGetAllVendorQuery(undefined, {
//     refetchOnMountOrArgChange: true,
//   });

//   console.log("data",data)

  
//   const [form, setForm] = useState<Record<string, any>>({
//         FirmName:"",
//         FirmAddress:"",
//         vendorCode:"",
//         FirmEmailId:""
            
//   });
// const [editingRow, setEditingRow] = useState<any>(null);
//   const [editForm, setEditForm] = useState<Record<string, any>>({});
//   useEffect(() => {
//     if (editingRow) {
//       setEditForm(editingRow);
//     }
//   }, [editingRow]);

//   const [updateItem] = useUpdateVendorMutation();
//   const [deleteItem] = useDeleteVendorMutation(); 
//   const[addItem] = useAddVendorMutation();

  
//   const [addModal, setAddModal] = useState(false);
   
//   const items = data?.data?.data ?? [];
//  console.log(items)
  
//   const fetchData = useCallback(
//     async (params?: { page: number; search?: string }) => {
//       const page = params?.page ?? 1;
//       const search = params?.search?.toLowerCase() ?? "";

//       const pageSize = 100; // rows per page

//       // Filter by search
//       let filtered = items;
//       if (search) {
//         filtered = items.filter((item: any) =>
//           Object.values(item).some((v) =>
//             String(v).toLowerCase().includes(search)
//           )
//         );
//       }

//       // Slice according to page
//       const start = (page - 1) * pageSize;
//       const end = start + pageSize;

//       return {
//         data: filtered.slice(start, end),
//         total: filtered.length,
//       };
//     },
//     [items]
//   );

//   // --------------------------
//   // EDIT SAVE HANDLER
//   // --------------------------
//   const handleSaveEdit = async (updated: any) => {
//     try {
       
//       await updateItem({ id: updated.id, data: updated }).unwrap();
//       toast.success("Updated successfully");
//       setEditingRow(null);
//       refetch();
//     } catch (err: any) {
//       toast.error(err?.data?.message || "Update failed");
//     }
//   };

  
// const handleDelete = async (row: any) => {
//   try {
//     // Extract the ID from the row object
//     const id = row.id || row.ID || row.Id; // Check common ID field names
//     if (!id) {
//       throw new Error('No ID found in row data');
//     }
//     await deleteItem(id).unwrap();
//     refetch();
//     toast.success("Deleted successfully");
//     refetch();
//   } catch (err: any) {
//     toast.error(err?.data?.message || err.message || "Delete failed");
//   }
// };

// const handleAdd = async (data: any) => {
//   try {
//     await addItem(data).unwrap();
//     refetch();
//     toast.success("Item Added Successfully");
//     setAddModal(false);
//     refetch();
//   } catch (err: any) {
//     toast.error(err?.data?.message || "Add failed");
//   }
// };


//   if (isLoading) return <div className={styles.loader}>Loading items...</div>;
//   if (isError) return <div className={styles.error}>Error loading items</div>;

//   return (
//     <div className={styles.container}>

//       {/* Import Excel */}
//       <div className={styles.btnWrapper}>
//          <Button
//             label="ADD"
//             buttonType= "one"
//             onClick={() => {console.log("clicked")
//             setAddModal(true)}}
//           />
//       </div>

//       {/* Title */}
//       <h1 className={styles.pageTitle}>PO Header</h1>

//       {/* Data Table */}
//        <div className={styles.tableWrapper}>
//         <DataTable
//           fetchData={fetchData}
//           loading={isLoading}
//           isSearch={true}
//           isExport={true}
//           isNavigate={true}  
//           columns={[
//             { label: "ID", accessor: "id" },
//             { label: "User ID", accessor: "userId" },
//             { label: "FirmName",accessor:"FirmName"},
//             { label:"FirmAddress",accessor:"FirmAddress"},
//             { label:"vendorCode",accessor:"vendorCode"},
//             { label:"FirmEmailId",accessor:"FirmEmailId"}

//           ]}
         
//           actions={[
//           {
//             label: "Edit",
//             buttonType: "one",
//             onClick: (row) => setEditingRow(row)

//           },
//           {
//             label: "Delete",
//             buttonType: "three",
//             onClick: async (row) => {
//               if (window.confirm('Are you sure you want to delete this item?')) {
//                 await handleDelete(row);
//               }
//             }
//           }
//         ]}
//         />
//       </div>

//       {/* Edit Modal */}
//       {editingRow && (
//         <Modal
//           title="Edit Item"
//           form={editForm}
//           onClose={() => setEditingRow(null)}
//           onSave={handleSaveEdit}
//         />
//       )}

//       {addModal && (
//         <Modal
//           title="Add New Item"
//           form={form}
//           onClose={() => setAddModal(false)}
//           onSave={(data) => {
//             handleAdd(data);
//             setAddModal(false);
//           }}
//         />
//       )}

     
//     </div>
//   );
// };

// export default vendorDetail;





import React, { useState, useCallback, useEffect } from "react";
import { DataTable } from "../../component/DataTable/DataTable"; 
import {
  useGetAllVendorQuery,
  useUpdateVendorMutation,
  useDeleteVendorMutation,
  useAddVendorMutation,
} from "../../store/services/vendor-detail";
import styles from "./VendorDetail.module.css";
import { toast } from "react-toastify";
import Button from "../../component/Button/Button";
import { RxCross2 } from "react-icons/rx";
import Input from "../../component/Input/Input2"; 
import { useForm } from "react-hook-form";

interface ModalProps { 
  title: string;
  form: Record<string, any>;
  onClose: () => void;
  onSave: (formData: Record<string, any>) => void;
  fields: string[];
}

const Modal: React.FC<ModalProps> = ({ title, form: initialForm, onClose, onSave, fields }) => {
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
          {fields.map((field) => (
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

const VendorDetail = () => {
  const { data, isLoading, isError, refetch } = useGetAllVendorQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const editableFields = {
    FirmName: "",
    FirmAddress: "",
    vendorCode: "",
    FirmEmailId: ""
  };

  const [form, setForm] = useState<Record<string, any>>({...editableFields});
  const [editingRow, setEditingRow] = useState<any>(null);
  const [editForm, setEditForm] = useState<Record<string, any>>({...editableFields});
  const [addModal, setAddModal] = useState(false);
  
  const [updateItem] = useUpdateVendorMutation();
  const [deleteItem] = useDeleteVendorMutation(); 
  const [addItem] = useAddVendorMutation();

  const items = data?.data?.data ?? [];

  useEffect(() => {
    if (editingRow) {
      // Only include the fields we want to be editable
      const editableData = { ...editableFields };
      Object.keys(editableFields).forEach(key => {
        editableData[key] = editingRow[key] || "";
      });
      setEditForm(editableData);
    }
  }, [editingRow]);

  const fetchData = useCallback(
    async (params?: { page: number; search?: string }) => {
      const page = params?.page ?? 1;
      const search = params?.search?.toLowerCase() ?? "";

      const pageSize = 100; 

      // Filter by search
      let filtered = items;
      if (search) {
        filtered = items.filter((item: any) =>
          Object.values(item).some((v) =>
            String(v).toLowerCase().includes(search)
          )
        );
      }

      return {
        data: filtered.slice((page - 1) * pageSize, page * pageSize),
        total: filtered.length,
      };
    },
    [items]
  );

  const handleSaveEdit = async (updated: any) => {
    try {
      await updateItem({ id: editingRow.id, data: updated }).unwrap();
      toast.success("Updated successfully");
      setEditingRow(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Update failed");
    }
  };

  const handleDelete = async (row: any) => {
    try {
      const id = row.id || row.ID || row.Id;
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
      setForm({...editableFields}); // Reset form
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Add failed");
    }
  };

  const handleAddClick = () => {
    setForm({...editableFields});
    setAddModal(true);
  };

  if (isLoading) return <div className={styles.loader}>Loading items...</div>;
  if (isError) return <div className={styles.error}>Error loading items</div>;

  return (
    <div className={styles.container}>
      
      <div className={styles.btnWrapper}>
        <Button
          label="ADD"
          buttonType="one"
          onClick={handleAddClick}
        />
      </div>
<h1 className={styles.pageTitle}>Vendor Detail</h1>
      <DataTable
        fetchData={fetchData}
        columns={[
          {label:"Id",accessor:"id"},
          { label: "Firm Name", accessor: "FirmName" },
          { label: "Firm Address", accessor: "FirmAddress" },
          { label: "Vendor Code", accessor: "vendorCode" },
          { label: "Email", accessor: "FirmEmailId" },
        ]}
        actions={[
          {
            label: "Edit",
            buttonType: "one",
            onClick: (row: any) => setEditingRow(row)
          },
          {
            label: "Delete",
            buttonType: "one",
            onClick: handleDelete
          }
        ]}
        loading={isLoading}
      />

      {editingRow && (
        <Modal
          title="Edit Vendor"
          form={editForm}
          onClose={() => setEditingRow(null)}
          onSave={handleSaveEdit}
          fields={Object.keys(editableFields)}
        />
      )}

      {addModal && (
        <Modal
          title="Add New Vendor"
          form={form}
          onClose={() => setAddModal(false)}
          onSave={handleAdd}
          fields={Object.keys(editableFields)}
        />
      )}
    </div>
  );
};

export default VendorDetail;