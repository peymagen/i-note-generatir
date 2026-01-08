import { useState, useCallback, useMemo } from "react";
import { DataTable } from "../../component/DataTable/DataTable"; 
import {
    useGetAllPODataQuery,
  useDeletePoDetailMutation
} from "../../store/services/po-details";
import styles from "./PoDetail.module.css";
import { toast } from "react-toastify";
import Button from "../../component/Button/Button";
import Modal from "../../component/Modal/index";
import ConfirmDialog from "../../component/ConfirmDialoge";
import {
  FiEdit,
  FiTrash2,
} from "react-icons/fi";
import type{PoDetailItem} from "../../types/poDetail"
import Manipulate from "./manipulate"

const PoDetail = () => {

  const [page, setPage] = useState<number | undefined>(undefined);
  const limit = 50;
  const [search, setSearch] = useState<string | undefined>(undefined);
  
    const {data, isLoading, isError,error, refetch} = useGetAllPODataQuery(
    { page, limit ,search},
    {
      refetchOnMountOrArgChange: true,
    }
  );
    console.log("isError:", isError, "error:", error);
  // const [editingId, setEditingId] = useState<number | null>(null);

  const [editingForm, setEditingForm] = useState<PoDetailItem | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PoDetailItem | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);


  const [deleteItem] = useDeletePoDetailMutation(); 
  /* ---------------- NORMALIZE API DATA ---------------- */

  // Backend nested response => actual items
  const items = useMemo(() => data?.data?.data ?? [], [data?.data?.data]);
  const pagination = data?.data?.pagination;

  const totalPages = pagination?.totalPages ?? 1;
  const totalRecords = data?.data?.pagination?.totalRecords ?? 0;

  console.log("Items:", items);
  console.log("Pagination:", pagination);
  console.log("Total Pages:", totalPages)
  console.log("Total Records:", totalRecords)
  // --------------------------                
  // FETCH DATA FOR DataTable (DataTable handles pagination!)
  // --------------------------
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
 
  
const handleDelete = async () => {
  if(!deleteTarget?.id){
    return;
  }
  try {
    const id = Number(deleteTarget.id) ;
    if (!id) {
      throw new Error('No ID found in row data');
    }
    await deleteItem(id).unwrap();
    toast.success("Deleted successfully");
    setLoadingAction(null)
    setDeleteTarget(null)
    refetch();
  } catch (err: unknown) {
    if(err instanceof Error){
      console.error(err.message);
      toast.error(err.message);
    }else{
      console.error(err);
      toast.error("Delete failed");
    }
  }
};

  const actions = [
      {
              label: "Edit",
              onClick: () => {},
      
              component: (row: PoDetailItem) => (
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
        component: (row: PoDetailItem) => (
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
            { label: "Order Line No", accessor: "OrderLineNo" },
            { label: "Item Code", accessor: "ItemCode" },
            {label:"ConsigneeCode", accessor:"ConsigneeCode"},
            { label: "OrderLineDRB", accessor: "OrderLineDRB" },
            { label: "Specs", accessor: "Specs" },
            { label: "Qty", accessor: "Qty" },
            { label: "UniCostCC", accessor: "UniCostCC" },
            { label: "Pilot SampleDRb", accessor: "PilotSampleDRb" },
            { label: "MIQPQty", accessor: "MIQPQty" },
            { label: "PackType", accessor: "PackType" },
            { label: "Station Code", accessor: "StationCode" },
            {label:"ReReferenced Item Code",accessor:"ReReferencedItemCode"},
            
    ]
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
        
      </div>

      {/* Title */}
      <h1 className={styles.pageTitle}>PO Details</h1>
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
        />
      </div>

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
        title={editingForm ? "Edit PoDetail" : "Add PoDetail"}
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
