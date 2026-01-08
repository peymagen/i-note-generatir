import { useState, useCallback, useMemo } from "react";
import { DataTable } from "../../component/DataTable/DataTable";
import {
  useGetAllVendorQuery,
  useDeleteVendorMutation,
} from "../../store/services/vendor-detail";
import styles from "./VendorDetail.module.css";
import { toast } from "react-toastify";
import Button from "../../component/Button/Button";
import { stripHtml } from "../../utils/stripHtml";
import Modal from "../../component/Modal/index";
import ConfirmDialog from "../../component/ConfirmDialoge";
import {
  FiEdit,
  FiTrash2,
} from "react-icons/fi";
import type{VendorItem}from "../../types/vendor"
import Manipulate from "./Manipulate"


const VendorDetail = () => {
  const [page, setPage] = useState(1);
  const limit = 50;
  const [search, setSearch] = useState<string>();

  const { data, isLoading, isError,error, refetch } = useGetAllVendorQuery(
    { page, limit, search },
    { refetchOnMountOrArgChange: true }
  );
  console.log("isError:", isError, "error:", error);

  
  // const [editingId, setEditingId] = useState<number | null>(null);

  const [editingForm, setEditingForm] = useState<VendorItem | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<VendorItem | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  

  // const [updateItem] = useUpdateVendorMutation();
  const [deleteItem] = useDeleteVendorMutation();
  // const [addItem] = useAddVendorMutation();

  /* ---------------- NORMALIZE API DATA ---------------- */

  const items = useMemo(() => {
    return (data?.data?.data ?? []).map((item: VendorItem ) => ({
      ...item,
    Id: Number(item.Id),
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

  

  /* ---------------- DELETE ---------------- */

  const handleDelete = async () => {
    if(!deleteTarget?.Id){
      toast.error("Invalid vendor ID");
      return;
    }
    setLoadingAction(deleteTarget.Id.toString());
    await deleteItem(deleteTarget.Id).unwrap();
    toast.success("Deleted successfully");
    setLoadingAction(null);
    setDeleteTarget(null);
    refetch();
  };


   const actions = [
      {
        label: "Edit",
        onClick: () => {},

        component: (row: VendorItem) => (
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
        component: (row: VendorItem) => (
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
  
    const columns = [
          { label: "Id", accessor: "Id" },
          { label: "Firm Name", accessor: "FirmName"},
          { label: "Firm Address", accessor: "FirmAddress", render: (row:VendorItem) => stripHtml(row.FirmAddress),},
          { label: "Vendor Code", accessor: "vendorCode"},
          { label: "Email", accessor: "FirmEmailId"},
          {label:"Contact Number", accessor:"ContactNumber"}
        ]
 
  return (
      <div className={styles.container}>
      
        <div className={styles.btnWrapper}>
          <Button
            label="ADD"
            buttonType="one"
            onClick={() => setAddModal(true) 
            }
          />
        </div> 
      <h1 className={styles.pageTitle}>Vendor Detail</h1>
      <div className={styles.tableBox}>
        <DataTable<VendorItem & { [x: string]: unknown }>
        fetchData={fetchData}
        columns={columns}
        actions={actions}
        loading={isLoading}
        isSearch={true}
        isExport={true}
        isNavigate={true}
      />
      </div>

      {deleteTarget && (
          <ConfirmDialog
            title="Delete Item"
            message={`Are you sure you want to delete ${deleteTarget.FirmName}? This action cannot be undone.`}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
            loading={loadingAction === deleteTarget.Id?.toString()}
          />
        )}

      {(addModal || editingForm) && (
        <Modal
          title={editingForm ? "Edit Vendor" : "Add Vendor"}
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

export default VendorDetail;
