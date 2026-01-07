import React, { useState, useCallback, useEffect, useMemo } from "react";
import { DataTable } from "../../component/DataTable/DataTable";
import {
  useGetAllMoDetailQuery,
  useImportMoDetailMutation,
  useUpdateMoDetailMutation,
  useAddMoDetailMutation,
  useDeleteMoDetailMutation,
} from "../../store/services/mo-detail";
import styles from "./Mo.module.css";
import { toast } from "react-toastify";
import Button from "../../component/Button/Button";
import { RxCross2 } from "react-icons/rx";
import Input from "../../component/Input/Input2";
import { useForm } from "react-hook-form";
import { stripHtml } from "../../utils/stripHtml";
import RichTextEditor from "../../component/RichEditor/RichEditor";


/* ================= TYPES ================= */

export interface FormData {
  id: number;
  MoCPRO: string;
  MoAddress: string;
};

const EDITABLE_FIELDS: Array<keyof Pick<FormData, "MoCPRO" | "MoAddress">> = [
  "MoCPRO",
  "MoAddress",
];

/* ================= MODAL ================= */

interface ModalProps {
  title: string;
  form: FormData;
  onClose: () => void;
  onSave: (data: FormData) => void;
}

const Modal: React.FC<ModalProps> = ({ title, form, onClose, onSave }) => {
  const { register, handleSubmit, reset,watch,setValue } = useForm<FormData>();

  useEffect(() => {
    reset(form);
  }, [form, reset]);

  const onSubmit = (data: FormData) => {
    onSave({ ...form, ...data }); // keep id
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{title}</h2>
          <RxCross2 className={styles.closeIcon} onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* {EDITABLE_FIELDS.map((field) => (
            <Input
              key={field}
              name={field}
              label={field}
              register={register}
              fullWidth
              required
            />
          ))} */}

          {EDITABLE_FIELDS.map((field) => {
            const name = field as keyof FormData;
          
                      if (name === "MoAddress") {
                        return (
                          <RichTextEditor<FormData>
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
            <Button
              type="button"
              label="Cancel"
              buttonType="three"
              onClick={onClose}
            />
            <Button type="submit" label="Save" buttonType="one" />
          </div>
        </form>
      </div>
    </div>
  );
};

/* ================= MAIN PAGE ================= */

const Mo = () => {
  const [page, setPage] = useState(1);
  const limit = 50;
  const [search, setSearch] = useState<string | undefined>(undefined);

  const { data, isLoading, isError, refetch } = useGetAllMoDetailQuery(
    { page, limit, search },
    { refetchOnMountOrArgChange: true }
  );

  const [editingRow, setEditingRow] = useState<FormData | null>(null);
  const [addModal, setAddModal] = useState(false);

  const [importExcel] = useImportMoDetailMutation();
  const [updateItem] = useUpdateMoDetailMutation();
  const [addItem] = useAddMoDetailMutation();
  const [deleteItem] = useDeleteMoDetailMutation();

  /* ================= DATA ================= */

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
    [items, totalRecords, page, search]
  );

  const [file, setFile] = useState<File | null>(null);
  /* ================= HANDLERS ================= */

   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const selectedFile = e.target.files?.[0];

  if (!selectedFile) return;

  setFile(selectedFile);

  try {
    await importExcel(selectedFile).unwrap();
    toast.success("Excel imported successfully!");
    refetch();
  } catch (err: unknown) {
    if(err instanceof Error){
      console.error(err.message);
      toast.error(err.message);
    }else{
      console.error(err);
      toast.error("Failed to import Excel!");
    }
  }
};

  const handleSaveEdit = async (data: FormData) => {
    try {
      await updateItem({ id: data.id, data }).unwrap();
      toast.success("Updated successfully");
      setEditingRow(null);
      refetch();
    } catch {
      toast.error("Update failed");
    }
  };

  const handleAdd = async (data: FormData) => {
    try {
      await addItem(data).unwrap();
      toast.success("Added successfully");
      setAddModal(false);
      refetch();
    } catch (error) {
      console.error('Add failed:', error);
      toast.error("Add failed");
    }
  };

  const handleDelete = async (row: FormData) => {
    if (!window.confirm("Are you sure?")) return;
    await deleteItem(row.id).unwrap();
    toast.success("Deleted");
    refetch();
  };

  /* ================= UI ================= */

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading data</div>;

  return (
    <div className={styles.container}>
      <div className={styles.btnWrapper}>
        <Button label="Add" buttonType="three" onClick={() => setAddModal(true)} />
          <input
          type="file"
          id="excel-upload"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          aria-label="Upload Excel File"
          className={styles.fileInput}
        />
        <Button
          label="Import"
          buttonType="three"
          onClick={() => document.getElementById('excel-upload')?.click()}
          loading={false}
        />
      </div>

      <h1 className={styles.pageTitle}>MO Details</h1>

      <DataTable
        fetchData={fetchData}
        loading={isLoading}
        isSearch
        isNavigate
        isExport
        columns={[
          { label: "ID", accessor: "id" },
          { 
            label: "MO Address", 
            accessor: "MoAddress", 
            render: (row: unknown) => stripHtml((row as FormData).MoAddress) 
          },
          { label: "MO/CPRO", accessor: "MoCPRO" },   
        ]}
        actions={[
          {
            label: "Edit",
            buttonType: "one",
            onClick: (row: unknown) => {
              const data = row as FormData;
              setEditingRow({
                id: data.id,
                MoCPRO: data.MoCPRO ?? "",
                MoAddress: data.MoAddress ?? "",
              });
            },
          },
          {
           label: "Delete",
            buttonType: "three",
            onClick: (row: unknown) => {
              const data = row as FormData;
              handleDelete({
                id: data.id,
                MoCPRO: data.MoCPRO ?? "",
                MoAddress: data.MoAddress ?? "",
              })
            }
          },
        ]}
      />

      {/* EDIT */}
      {editingRow && (
        <Modal
          title="Edit Item"
          form={editingRow}
          onClose={() => setEditingRow(null)}
          onSave={handleSaveEdit}
        />
      )}

      {/* ADD */}
      {addModal && (
        <Modal
          title="Add Item"
          form={{id:0, MoCPRO: "", MoAddress: "" }}
          onClose={() => setAddModal(false)}
          onSave={handleAdd}
        />
      )}
    </div>
  );
};

export default Mo;
