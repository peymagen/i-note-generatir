import React, { useState, useCallback, useEffect, useMemo } from "react";
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
import RichTextEditor from "../../component/RichEditor/RichEditor";
import { stripHtml } from "../../utils/stripHtml";

/* ---------------- TYPES ---------------- */

export type FormData = {
  Id: number;
  FirmName: string;
  FirmAddress: string;
  vendorCode: string;
  FirmEmailId: string;
};

interface VendorItem {
  id: number;
  FirmName: string;
  FirmAddress: string;
  vendorCode: string;
  FirmEmailId: string;
}

export type EditableFormData = Omit<FormData, "Id">;

/* ---------------- MODAL ---------------- */

interface ModalProps {
  title: string;
  form: EditableFormData;
  onClose: () => void;
  onSave: (formData: EditableFormData) => void;
}

const Modal: React.FC<ModalProps> = ({ title, form, onClose, onSave }) => {
  const { register, handleSubmit, reset,watch,setValue } = useForm<EditableFormData>({
    defaultValues: form,
  });

  useEffect(() => {
    reset(form);
  }, [form, reset]);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{title}</h2>
          <RxCross2 className={styles.closeIcon} onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit(onSave)}>
          {/* {Object.keys(form).map((field) => (
            <Input
              key={field}
              label={field}
              name={field as keyof EditableFormData}
              register={register}
              fullWidth
              required
            />
          ))} */}
          {Object.keys(form).map((field) => {
            const name = field as keyof EditableFormData;

            if (name === "FirmAddress") {
              return (
                <RichTextEditor<EditableFormData>
                  key={name}
                  label="Firm Address"
                  name={name}
                  watch={watch}
                  setValue={setValue}
                  required
                />
              );
            }

            return (
              <Input
                key={name}
                label={name}
                name={name}
                register={register}
                fullWidth
                required
              />
            );
          })}


          <div className={styles.modalActions}>
            <Button type="button" label="Cancel" buttonType="three" onClick={onClose} />
            <Button type="submit" label="Save" buttonType="one" />
          </div>
        </form>
      </div>
    </div>
  );
};


const VendorDetail = () => {
  const [page, setPage] = useState(1);
  const limit = 50;
  const [search, setSearch] = useState<string>();

  const { data, isLoading, isError, refetch } = useGetAllVendorQuery(
    { page, limit, search },
    { refetchOnMountOrArgChange: true }
  );

  
  const [editingId, setEditingId] = useState<number | null>(null);

  const [editingForm, setEditingForm] = useState<EditableFormData | null>(null);
  const [addModal, setAddModal] = useState(false);

  const [updateItem] = useUpdateVendorMutation();
  const [deleteItem] = useDeleteVendorMutation();
  const [addItem] = useAddVendorMutation();

  /* ---------------- NORMALIZE API DATA ---------------- */

  const items = useMemo(() => {
    return (data?.data?.data ?? []).map((item: VendorItem ) => ({
      ...item,
    id: Number(item.id),
  }));
  }, [data]);

  const totalRecords = data?.data?.pagination?.totalRecords ?? 0;

  /* ---------------- FETCH TABLE DATA ---------------- */

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

  /* ---------------- UPDATE ---------------- */

  const handleSaveEdit = async (updated: EditableFormData) => {
    console.log("Updated:", updated);
    console.log("Editing ID:", editingId);
    if (!editingId) {
      toast.error("Invalid vendor ID");
      return;
    }

    await updateItem({
      id: editingId,
      data: { ...updated, Id: editingId },
    }).unwrap();

    toast.success("Updated successfully");
    setEditingId(null);
    setEditingForm(null);
    refetch();
  };

  /* ---------------- DELETE ---------------- */

  const handleDelete = async (row: FormData) => {
    await deleteItem(row.Id).unwrap();
    toast.success("Deleted successfully");
    refetch();
  };

  /* ---------------- ADD ---------------- */

  const handleAdd = async (data: EditableFormData) => {
    await addItem(data).unwrap();
    toast.success("Added successfully");
    setAddModal(false);
    refetch();
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading vendors</div>;

  return (
      <div className={styles.container}>
      
        <div className={styles.btnWrapper}>
          <Button
            label="ADD"
            buttonType="one"
            onClick={() => setAddModal(true)}
          />
        </div>
  <h1 className={styles.pageTitle}>Vendor Detail</h1>
      <DataTable
        fetchData={fetchData}
        columns={[
          { label: "Id", accessor: "Id" },
          { label: "Firm Name", accessor: "FirmName"},
          { label: "Firm Address", accessor: "FirmAddress", render: (row:FormData) => stripHtml(row.FirmAddress),},
          { label: "Vendor Code", accessor: "vendorCode"},
          { label: "Email", accessor: "FirmEmailId"},
        ]}
        actions={[
          {
            label: "Edit",
            buttonType: "one",
            onClick: (row: FormData) => {
              setEditingId(row.Id);
              setEditingForm({
                FirmName: row.FirmName,
                FirmAddress: row.FirmAddress,
                vendorCode: row.vendorCode,
                FirmEmailId: row.FirmEmailId,
              });
            },
          },
          {
            label: "Delete",
            buttonType: "three",
            onClick: (row: FormData) => handleDelete(row),
          },
        ]}
        loading={isLoading}
        isSearch={true}
        isExport={true}
        isNavigate={true}
      />

      {editingForm && (
        <Modal
          title="Edit Vendor"
          form={editingForm}
          onClose={() => {
            setEditingId(null);
            setEditingForm(null);
          }}
          onSave={handleSaveEdit}
        />
      )}

      {addModal && (
        <Modal
          title="Add Vendor"
          form={{
            FirmName: "",
            FirmAddress: "",
            vendorCode: "",
            FirmEmailId: "",
          }}
          onClose={() => setAddModal(false)}
          onSave={handleAdd}
        />
      )}
    </div>
  );
};

export default VendorDetail;
