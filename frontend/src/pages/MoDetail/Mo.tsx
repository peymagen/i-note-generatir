import React, { useState, useCallback, useMemo } from "react";
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
import { stripHtml } from "../../utils/stripHtml";
import Modal from "../../component/Model2/Model";
import * as yup from "yup";
import {
  FiEdit,
  FiTrash2,
} from "react-icons/fi";
import ConfirmDialog from "../../component/ConfirmDialoge";
import type { FieldConfig } from "../../component/Model2/Model";

/* ================= TYPES ================= */

export type FormData = {
  id: number;
  MoCPRO: string;
  MoAddress: string;
};

/* ================= YUP SCHEMA ================= */

const moSchema = yup.object({
  MoCPRO: yup.string().required("MO / CPRO is required"),
  MoAddress: yup.string().required("MO Address is required"),
});

export type EditableFormData = yup.InferType<typeof moSchema>;

// const EDITABLE_FIELDS: (keyof EditableFormData)[] = ["MoCPRO", "MoAddress"];

const moFields: FieldConfig<EditableFormData>[] = [
  {
    name: "MoCPRO",
    label: "MO / CPRO",
    type: "input",
    required: true,
  },
  {
    name: "MoAddress",
    label: "MO Address",
    type: "richtext",
    required: true,
  },
];


const Mo = () => {
  const [page, setPage] = useState(1);
  const limit = 50;
  const [search, setSearch] = useState<string | undefined>(undefined);

  const { data, isLoading, isError, error,refetch } = useGetAllMoDetailQuery(
    { page, limit, search },
    { refetchOnMountOrArgChange: true }
  );

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingForm, setEditingForm] = useState<EditableFormData | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FormData | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

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

  /* ================= HANDLERS ================= */

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    try {
      await importExcel(selectedFile).unwrap();
      toast.success("Excel imported successfully!");
      refetch();
    } catch {
      toast.error("Failed to import Excel!");
    }
  };

  const handleSaveEdit = async (updated: EditableFormData) => {
    if (!editingId) return;

    try {
      await updateItem({
        id: editingId,
        data: { ...updated, id: editingId },
      }).unwrap();

      toast.success("Updated successfully");
      setEditingId(null);
      setEditingForm(null);
      refetch();
    } catch {
      toast.error("Update failed");
    }
  };

  const handleAdd = async (data: EditableFormData) => {
    try {
      await addItem(data).unwrap();
      toast.success("Added successfully");
      setAddModal(false);
      refetch();
    } catch {
      toast.error("Add failed");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    setLoadingAction(deleteTarget?.id?.toString() || "");
    await deleteItem(deleteTarget?.id).unwrap();
    toast.success("Deleted");
    setDeleteTarget(null);
    refetch();
  };

  

  const columns=[
          { label: "ID", accessor: "id" },
          
          { label: "MO/CPRO", accessor: "MoCPRO" },
          {
            label: "MO Address",
            accessor: "MoAddress",
            render: (row: unknown) =>
              stripHtml((row as FormData).MoAddress),
          },
        ]
  const actions = [
    {
      label: "Edit",
      onClick: () => {},
      component: (row: EditableFormData) => (
        <button
          className={`${styles.iconBtn} ${styles.edit}`}
          title="Edit User"
          onClick={() => {
            const r = row as FormData;
            setEditingId(r.id);
            setEditingForm({
              MoCPRO: r.MoCPRO,
              MoAddress: r.MoAddress,
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
  ]

  return (
    <div className={styles.container}>
      <div className={styles.btnWrapper}>
        <Button
          label="Add"
          buttonType="three"
          onClick={() => setAddModal(true)}
        />

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
          onClick={() =>
            document.getElementById("excel-upload")?.click()
          }
        />
      </div>
      {isError && (
        <p className={styles.errorMsg}>
          {"message" in error ? error.message : "Failed to load users"}
        </p>
      )}

      <h1 className={styles.pageTitle}>MO Details</h1>
    <div className={styles.tableBox}>
      <DataTable
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
      message={`Are you sure you want to delete ${deleteTarget.MoCPRO}? This action cannot be undone.`}
      onCancel={() => setDeleteTarget(null)}
      onConfirm={handleDelete}
      loading={loadingAction === deleteTarget.id?.toString()}
    />
  )}
        

      {/* EDIT */}
      {/* {editingForm && (
        <Modal
          title="Edit Item"
          form={editingForm}
          onClose={() => {
            setEditingId(null);
            setEditingForm(null);
          }}
          onSave={handleSaveEdit}
        />
      )} */}
      {editingForm && (
        <Modal<EditableFormData>
          title="Edit Item"
          form={editingForm}
          fields={moFields}
          schema={moSchema}
          onClose={() => {
            setEditingId(null);
            setEditingForm(null);
          }}
          onSave={handleSaveEdit}
        />
      )}


      {/* ADD */}
      {addModal && (
        <Modal<EditableFormData>
          title="Add Item"
          form={{ MoCPRO: "", MoAddress: "" }}
          fields={moFields}
          schema={moSchema}
          onClose={() => setAddModal(false)}
          onSave={handleAdd}
        />
      )}

    </div>
  );
};

export default Mo;
