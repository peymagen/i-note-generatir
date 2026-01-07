import { useState, useCallback, useMemo } from "react";
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
import { stripHtml } from "../../utils/stripHtml";
import * as yup from "yup";
import type { FieldConfig } from "../../component/Model2/Model";
import Modal from "../../component/Model2/Model";
import ConfirmDialog from "../../component/ConfirmDialoge";
import {
  FiEdit,
  FiTrash2,
} from "react-icons/fi";
/* ---------------- TYPES ---------------- */

export type FormData = {
  Id: number;
  FirmName: string;
  FirmAddress: string;
  vendorCode: string;
  FirmEmailId?: string;
  ContactNumber?: string;
};

interface VendorItem {
  Id: number;
  FirmName: string;
  FirmAddress: string;
  vendorCode: string;
  FirmEmailId?: string;
  ContactNumber?: string;
}

const vendorSchema = yup.object({
  FirmName: yup.string().required("Firm Name is required"),
  FirmAddress: yup.string().required("Firm Address is required"),
  vendorCode: yup.string().required("Vendor Code is required"),
  FirmEmailId: yup.string().optional(),
  ContactNumber: yup.string().optional(),
});

// export type EditableFormData = Omit<FormData, "Id">;
export type EditableFormData = yup.InferType<typeof vendorSchema>;

const vendorFields: FieldConfig<EditableFormData>[] = [
  {
    name: "FirmName",
    label: "Firm Name",
    type: "input",
    required: true,
  },
  {
    name: "FirmAddress",
    label: "Firm Address",
    type: "richtext",
    required: true,
  },
  {
    name:"vendorCode",
    label:"Vendor Code",
    type:"input",
    required:true
  },
  {
    name:"FirmEmailId",
    label:"Email ID",
    type:"input",
    required:false
  },
  {
    name:"ContactNumber",
    label:"Contact Number",
    type:"input",
    required:false
  }
];


const VendorDetail = () => {
  const [page, setPage] = useState(1);
  const limit = 50;
  const [search, setSearch] = useState<string>();

  const { data, isLoading, isError,error, refetch } = useGetAllVendorQuery(
    { page, limit, search },
    { refetchOnMountOrArgChange: true }
  );

  
  const [editingId, setEditingId] = useState<number | null>(null);

  const [editingForm, setEditingForm] = useState<EditableFormData | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FormData | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  

  const [updateItem] = useUpdateVendorMutation();
  const [deleteItem] = useDeleteVendorMutation();
  const [addItem] = useAddVendorMutation();

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

  const handleSaveEdit = async (updated: EditableFormData) => {
    if(!editingId){
      toast.error("Invalid vendor ID");
      return;
    }
    console.log("Updated:", updated);
    console.log("Editing ID:", editingId);
    try{
      await updateItem({
        id: editingId,
        data: { ...updated, Id: editingId },
      }).unwrap();
      
      toast.success("Updated successfully");
      setEditingId(null);
      setEditingForm(null);
      refetch();
    }
    catch{
      toast.error("Update failed");
    }
    

    

  };

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

  /* ---------------- ADD ---------------- */

  const handleAdd = async (data: EditableFormData) => {
    await addItem(data).unwrap();
    toast.success("Added successfully");
    setAddModal(false);
    refetch();
  };

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
              setEditingId(r.Id);
              setEditingForm({
                FirmName: r.FirmName,
                FirmAddress: r.FirmAddress,
                vendorCode: r.vendorCode,
                FirmEmailId: r.FirmEmailId,
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
  
    const columns = [
          { label: "Id", accessor: "Id" },
          { label: "Firm Name", accessor: "FirmName"},
          { label: "Firm Address", accessor: "FirmAddress", render: (row:FormData) => stripHtml(row.FirmAddress),},
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
            onClick={() => setAddModal(true)}
          />
        </div>
        {isError && (
          <p className={styles.errorMsg}>
            {"message" in error ? error.message : "Failed to load users"}
          </p>
        )}
  <h1 className={styles.pageTitle}>Vendor Detail</h1>
      <div className={styles.tableBox}>
        <DataTable
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

      {editingForm && (
        <Modal<EditableFormData>
          title="Edit Vendor"
          form={editingForm}
          fields={vendorFields}
          schema={vendorSchema}
          onClose={() => {
            setEditingId(null);
            setEditingForm(null);
          }}
          onSave={handleSaveEdit}
        />
      )}

      {addModal && (
        <Modal<EditableFormData>
          title="Add Vendor"
          form={{
            FirmName: "",
            FirmAddress: "",
            vendorCode: "",
            FirmEmailId: "",
          }}
          fields={vendorFields}  
          schema={vendorSchema} 
          onClose={() => setAddModal(false)}
          onSave={handleAdd}
        />
      )}
    </div>
  );
};

export default VendorDetail;
