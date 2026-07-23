import { useState, useCallback,useMemo } from "react";
import { DataTable } from "../../component/DataTable/DataTable"; 
import {
  useGetAllItemDetailsQuery,
  useDeleteItemDetailMutation,
  useDeleteBulkItemDetailsMutation,
} from "../../store/services/item-details";
import styles from "./ItemDetail.module.css";
import { toast } from "react-toastify";
import Button from "../../component/Button/Button";
import Modal from "../../component/Modal/index"
import ConfirmDialog from "../../component/ConfirmDialoge";
import {
  FiEdit,
  FiTrash2,
} from "react-icons/fi";
import type{itemDetail} from "../../types/itemDetail"
import Manipulate from "./Manipulate";

const ItemDetail = () => {
  
  const [page, setPage] = useState<number>(1);
  const limit = 50;
  const [search, setSearch] = useState<string | undefined>(undefined);

  const {data, isLoading,  refetch} = useGetAllItemDetailsQuery(
  { page, limit ,search},
  {
    refetchOnMountOrArgChange: true,
  }
);


  const [editingForm, setEditingForm] = useState<itemDetail | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<itemDetail | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const [deleteItem] = useDeleteItemDetailMutation(); 
  const [deleteBulkItems] = useDeleteBulkItemDetailsMutation();



  const items = useMemo(() => data?.data?.data ?? [], [data?.data?.data]);
  const totalRecords = data?.data?.pagination?.totalRecords ?? 0;

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
    setLoadingAction(deleteTarget.id.toString());
    await deleteItem(deleteTarget.id).unwrap();
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

        component: (row: itemDetail) => (
          <button
            className={`${styles.iconBtn} ${styles.edit}`}
            title="Edit User"
            onClick={()=>{setEditingForm(row)}}
          >
            <FiEdit size={18} />
          </button>
        ),
      },
  {
    label: "Delete",
    onClick: () => {}, 
    component: (row: itemDetail) => (
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
            { label: "Indent No", accessor: "IndentNo" },
            { label: "Vendor Code", accessor: "VendorCode" },
            { label: "Order Date", accessor: "OrderDate" },
            { label: "Order Line No", accessor: "OrderLineNo" },
            { label: "Item Code", accessor: "ItemCode" },
            { label: "Section Head", accessor: "SectionHead" },
            { label: "Item Description", accessor: "ItemDesc" },
            { label: "Country", accessor: "CountryCode" },
            { label: "Item Deno", accessor: "ItemDeno" }, 
            { label: "Month Shelf Life", accessor: "MonthsShelfLife" },
            { label: "CRP Category", accessor: "CRPCategory" },
            { label: "VEDC Category", accessor: "VEDCCategory" },
            { label: "ABC Category", accessor: "ABCCategory" },
            {label:"DateTimeApproved", accessor:"DateTimeApproved"},
            {label:"ApprovedBy", accessor:"ApprovedBy"},
            {label:"ReviewSubSectionCode", accessor:"ReviewSubSectionCode"},
            {label:"INCATYN", accessor:"INCATYN"},
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
        <Button
          label="Delete Selected"
          buttonType="one"
          onClick={() => setIsDeletingMultiple(true)}
          disabled={selectedItems.length === 0}
        />
      </div>
      {/* Title */}
      <h1 className={styles.pageTitle}>Item Details</h1>

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
            const ids = (rows as itemDetail[])
              .map((row) => row.id!)
              .filter(Boolean);
            setSelectedItems(ids);
          }}
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

      {isDeletingMultiple && (
        <ConfirmDialog
          title="Delete Selected Items"
          message={`Are you sure you want to delete ${selectedItems.length} items? This action cannot be undone.`}
          onCancel={() => setIsDeletingMultiple(false)}
          onConfirm={handleDeleteMultiple}
          loading={loadingAction === "multiple"}
        />
      )}

      {/* Edit Modal */}
      {(addModal || editingForm) && (
        <Modal
          title={editingForm ? "Edit Item" : "Add Item"}
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

export default ItemDetail;
