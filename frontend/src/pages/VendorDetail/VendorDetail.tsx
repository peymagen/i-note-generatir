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