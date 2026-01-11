import React, { useState, useCallback, useMemo } from "react";
import { DataTable } from "../../component/DataTable/DataTable";
import {
  useGetAllMoDetailQuery,
  useImportMoDetailMutation,
  useDeleteMoDetailMutation,
} from "../../store/services/mo-detail";
import styles from "./Mo.module.css";
import { toast } from "react-toastify";
import Button from "../../component/Button/Button";
import { stripHtml } from "../../utils/stripHtml";
import Modal from "../../component/Modal/index";
import {
  FiEdit,
  FiTrash2,
} from "react-icons/fi";
import ConfirmDialog from "../../component/ConfirmDialoge";
import Manipulate from "./Manipulate";
import type{MoItem}from "../../types/mo"



const Mo = () => {
  const [page, setPage] = useState(1);
  const limit = 50;
  const [search, setSearch] = useState<string | undefined>(undefined);

  const { data, isLoading, isError, error,refetch } = useGetAllMoDetailQuery(
    { page, limit, search },
    { refetchOnMountOrArgChange: true }
  );
    console.log("isError:", isError, "error:", error);

  // const [editingId, setEditingId] = useState<number | null>(null);
  const [editingForm, setEditingForm] = useState<MoItem | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MoItem | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const [importExcel] = useImportMoDetailMutation();
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
              stripHtml((row as MoItem).MoAddress),
          },
        ]
  const actions = [
    {
        label: "Edit",
        onClick: () => {},

        component: (row: MoItem) => (
          <button
            className={`${styles.iconBtn} ${styles.edit}`}
            title="Edit User"
            onClick={()=>{setEditingForm(row)
              console.log("row:",row);
            }}
          >
            <FiEdit size={18} />
          </button>
        ),
      },
    {
      label: "Delete",
      onClick: () => {},
      component: (row: MoItem) => (
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

      <h1 className={styles.pageTitle}>MO Details</h1>
    <div className={styles.tableBox}>
      <DataTable<MoItem & { [x: string]: unknown }>
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
        

     
      {(editingForm || addModal) && (
        <Modal
          title={editingForm ? "Edit Mo" : "Add Mo"}
          onClose={()=>{
            setAddModal(false);
            setEditingForm(null);
          }}
        >
          <Manipulate
            mode={editingForm ? "edit" : "create"}
            defaultValues={editingForm || undefined}
            onSubmitSuccess={()=>{
              setAddModal(false);
              setEditingForm(null);
              refetch();
            }}
            />
          </Modal>
      )}


    </div>
  );
};

export default Mo;
