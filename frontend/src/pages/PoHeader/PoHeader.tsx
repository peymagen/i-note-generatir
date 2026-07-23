import  { useState, useCallback, useMemo } from "react";
import { DataTable } from "../../component/DataTable/DataTable"; 
import {
  useGetAllPOHeaderQuery,
  useDeletePoHeaderMutation,
  useDeleteBulkPoHeaderMutation
} from "../../store/services/po-header";
import styles from "./PoHeader.module.css";
import { toast } from "react-toastify";
import Button from "../../component/Button/Button"; 
import Modal from "../../component/Modal/index";
import ConfirmDialog from "../../component/ConfirmDialoge";
import {
  FiEdit,
  FiTrash2,
} from "react-icons/fi";
import type{PoHeaderItem} from "../../types/poHeader"
import Manipulate from "./Manipulate"

const PoDetail = () => {

    const [page, setPage] = useState<number | undefined>(undefined);
    const limit = 50;
    const [search, setSearch] = useState<string | undefined>(undefined);
  
    const {data, isLoading, refetch} = useGetAllPOHeaderQuery(
    { page, limit ,search},
    {
      refetchOnMountOrArgChange: true,
    }
  );
   

  const [editingForm, setEditingForm] = useState<PoHeaderItem | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PoHeaderItem | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false);
  const [deleteBulkItems] = useDeleteBulkPoHeaderMutation();

  const [deleteItem] = useDeletePoHeaderMutation(); 


  const items = useMemo(() => data?.data?.data ?? [], [data?.data?.data]);
 const totalRecords = data?.data?.pagination?.totalRecords ?? 0;
 


 
  // --------------------------                
  // FETCH DATA FOR DataTable (DataTable handles pagination!)
  // --------- -----------------
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


const handleDeleteMultiple = async () => {
  if (selectedItems.length === 0) {
    toast.error("No items selected");
    return;
  }
  try {
    setLoadingAction("multiple");
    const response = await deleteBulkItems(selectedItems).unwrap();
    console.log("Delete response:", response); 
    toast.success(response.message);
    setLoadingAction(null);
    setIsDeletingMultiple(false);
    setSelectedItems([]);
    refetch();
  } catch (err: unknown) {
    if (err instanceof Error) {
      toast.error(err.message);
    } else {
      toast.error("Delete failed");
    }
    setLoadingAction(null);
  }
};
const handleDelete = async () => {
  if(!deleteTarget?.id){
      toast.error("Invalid error")
      return
    }
  try {
   
    const id = Number(deleteTarget.id);
    await deleteItem(id).unwrap();
    toast.success("Deleted successfully");
    setLoadingAction(null)
    setDeleteTarget(null)
    refetch();
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
      toast.error(err.message);
    } else {
      console.error(err);
      toast.error("Delete failed");
    }
  }
};


  const actions = [
    {
        label: "Edit",
        onClick: () => {},

        component: (row: PoHeaderItem) => (
          <button
            className={`${styles.iconBtn} ${styles.edit}`}
            title="Edit User"
            onClick={()=>{setEditingForm(row)
              
            }}
          >
            <FiEdit size={18} />
          </button>
        ),
      },
    {
      label: "Delete",
      onClick: () => {}, 
      component: (row: PoHeaderItem) => (
        <button
          className={`${styles.iconBtn} ${styles.delete}`}
          title="Delete"
          onClick={() => setDeleteTarget(row)}
        >
          <FiTrash2 size={18} />
        </button>
      ),
    },
  ];
  const columns = [
    { label: "ID", accessor: "id" },
            { label: "User ID", accessor: "userId" },
            { label: "Indent No", accessor: "IndentNo" },
            { label: "Vendor Code", accessor: "VendorCode" },
            { label: "Order Date", accessor: "OrderDate" },
            { label: "ValueRs", accessor: "ValueRs" },
            { label: "Inspecting Agency Type", accessor: "InspectingAgencyType" },
            { label:"InspectorCode", accessor:"InspectorCode"},
            { label: "InspectionSiteCode", accessor: "InspectionSiteCode" },
            { label: "Remarks", accessor: "Remarks" },
            { label: "QuoteKey", accessor: "QuoteKey" },
            { label: "SelectedQuote Date ", accessor: "SelectedQuoteDate" },
            { label: "DateTime Approved", accessor: "DateTimeApproved" },
            { label: "ApprovedBy", accessor: "ApprovedBy" },
            { label: "Type Closing", accessor: "TypeClosing" },
            { label: "Date Cloded", accessor: "DateCloded" },
            {label:"Packing Instruction",accessor:"PackingInstruction"},
            {label:"Despatch Instruction",accessor:"DespatchInstruction"},
            {label:"Inspection Instruction",accessor:"InspectionInstruction"},
            {label:"StationCode",accessor:"StationCode"},
            {label:"Remarks1",accessor:"Remarks1"},
            {label:"Name",accessor:"Name"},
            {label:"City",accessor:"City"},
            {label:"State",accessor:"State"}

  ]
  return (
    <div className={styles.container}>

      {/* Import Excel */}
      <div className={styles.btnWrapper}>
         <Button
            label="Add"
            buttonType= "three"
            onClick={() => {setAddModal(true)}}
          />
          <Button
          label="Delete Selected"
          buttonType="one"
          onClick={() => setIsDeletingMultiple(true)}
          disabled={selectedItems.length === 0}
        />

      </div>

      {/* Title */}
      <h1 className={styles.pageTitle}>PO Header</h1>

      {/* Data Table */}
       <div className={styles.tableWrapper}>
        <DataTable
          fetchData={fetchData}
          loading={isLoading}
          isSearch={true}
          isExport={true}
          isNavigate={true}  
          columns={columns}
          actions={actions}
          hasCheckbox={true}
          onSelectedRows={(rows) => {
            const ids = (rows as PoHeaderItem[])
              .map((row) => row.id!)
              .filter(Boolean);
            setSelectedItems(ids);
          }}
        />
      </div>
      {isDeletingMultiple && (
        <ConfirmDialog
          title="Delete Selected Items"
          message={`Are you sure you want to delete ${selectedItems.length} items? This action cannot be undone.`}
          onCancel={() => setIsDeletingMultiple(false)}
          onConfirm={handleDeleteMultiple}
          loading={loadingAction === "multiple"}
        />
      )}
      {deleteTarget && (
              <ConfirmDialog
                title="Delete Item"
                message={`Are you sure you want to delete ${deleteTarget.IndentNo}? This action cannot be undone.`}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                loading={loadingAction === deleteTarget.id?.toString()}
              />
            )}

      {/* Edit Modal */}
      {(editingForm || addModal) && (
          <Modal
          title={editingForm ? "Edit PoHeader" : "Add PoHeader"}
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

export default PoDetail;
