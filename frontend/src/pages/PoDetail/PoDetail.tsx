import React, { useState, useCallback, useMemo } from "react";
import { DataTable } from "../../component/DataTable/DataTable"; 
import {
    useGetAllPODataQuery,
  // useImportPODataMutation,
  useUpdatePODataMutation,
  useAddPoDetailMutation,
  useDeletePoDetailMutation
} from "../../store/services/po-details";
import styles from "./PoDetail.module.css";
import { toast } from "react-toastify";
import Button from "../../component/Button/Button";
import * as yup from "yup";
import type { FieldConfig } from "../../component/Model2/Model";
import Modal from "../../component/Model2/Model";
import ConfirmDialog from "../../component/ConfirmDialoge";
import {
  FiEdit,
  FiTrash2,
} from "react-icons/fi";


export type FormData =  {
  id: number;
  IndentNo?: string;
    VendorCode?: string;
    OrderDate?: string;  
    OrderLineNo?: number;
    ItemCode?: string;
    ConsigneeCode?: string;
    OrderLineDRB?: string;
    Specs?: string;
    Qty?: number;  
    UniCostCC?: number;
    PilotSampleDRb?: string ; 
    MIQPQty?: number; 
    PackType?: string;  
    StationCode?: string ;  
    ReReferencedItemCode?: string;
};

const poDetainSchema = yup.object({
    IndentNo: yup.string().optional(),
    VendorCode: yup.string().optional(),
    OrderDate: yup.string().optional(),
    OrderLineNo: yup.number().optional(),
    ItemCode: yup.string().optional(),
    ConsigneeCode: yup.string().optional(),
    OrderLineDRB: yup.string().optional(),
    Specs: yup.string().optional(),
    Qty: yup.number().optional(),
    UniCostCC: yup.number().optional(),
    PilotSampleDRb: yup.string().optional(),
    MIQPQty: yup.number().optional(),
    PackType: yup.string().optional(),
    StationCode: yup.string().optional(),
    ReReferencedItemCode: yup.string().optional(),
});

export type EditableformData = Omit<FormData, 'id'>;

const poDetailField : FieldConfig<EditableformData>[]=[
    {
      name:"IndentNo",
      label:"Indent No",
      type:"input",
      required:"false"
    },
      {
      name:"VendorCode",
      label:"Vendor Code",
      type:"input",
      required:"false"
    },
      {
      name:"OrderDate",
      label:"Order Date",
      type:"input",
      required:"false"
    },
    {
        name:"ItemCode",
        label:"Item Code",
        type:"input",
        required:"false"
      },
        {
        name:"ConsigneeCode",
        label:"Consignee Code",
        type:"input",
        required:"false"
      },
        {
        name:"OrderLineDRB",
        label:"Order Line DRB",
        type:"input",
        required:"false"
      },
      {
          name:"Specs",
          label:"Specs",
          type:"input",
          required:"false"
        },
          {
          name:"Qty",
          label:"Qty",
          type:"input",
          required:"false"
        },
          {
          name:"UniCostCC",
          label:"Uni Cost CC",
          type:"input",
          required:"false"
        },
        {
    name:"PilotSampleDRb",
    label:"Pilot Sample DRb",
    type:"input",
    required:"false"
  },
    {
    name:"MIQPQty",
    label:"MI QP Qty",
    type:"input",
    required:"false"
  },
    {
    name:"PackType",
    label:"Pack Type",
    type:"input",
    required:"false"
  },
  {
    name:"StationCode",
    label:"Station Code",
    type:"input",
    required:"false"
  },
  {
    name:"ReReferencedItemCode",
    label:"Re Referenced Item Code",
    type:"input",
    required:"false"
  }
]


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
  const [editingId, setEditingId] = useState<number | null>(null);

  const [editingForm, setEditingForm] = useState<EditableFormData | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FormData | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);



  const [updateItem] = useUpdatePODataMutation();
  const [deleteItem] = useDeletePoDetailMutation(); 
  const [addItem] = useAddPoDetailMutation();

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
  
  // --------------------------
  // EDIT SAVE HANDLER
  // --------------------------
  const handleSaveEdit = async (updated:EditableFormData) => {
    if (!editingId) return;
    
    try {
      await updateItem({ id: editingId, data: updated }).unwrap();
      toast.success("PO detail updated successfully");
      setEditingId(null);
      setEditingForm(null)
      refetch();
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
        toast.error(err.message);
      } else {
        console.error(err);
        toast.error("Update failed");
      }
    }
  };

  
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

const handleAdd = async (formData: EditableFormData) => {
  try {
    await addItem(formData).unwrap();
    toast.success("Item Added Successfully");
    setAddModal(false);
    refetch();
  } catch (err: unknown) {
    if(err instanceof Error){
      console.error(err.message);
      toast.error(err.message);
    }else{
      console.error(err);
      toast.error("Add failed");
    }
  }
};
  const actions = [
      {
        label: "Edit",
        onClick: () => {},
        component: (row: FormData) => ( 
          <button
            className={`${styles.iconBtn} ${styles.edit}`}
            title="Edit Item"
            onClick={() => {
              console.log("PPPPPP",row)
              setEditingId(row.id);
              setEditingForm({
                IndentNo: row.IndentNo,
                VendorCode: row.VendorCode,
                OrderDate: row.OrderDate,
                OrderLineNo:row.OrderLineNo,
                ItemCode:row.ItemCode,
                ConsigneeCode:row.ConsigneeCode,
                OrderLineDRB:row.OrderLineDRB,
                Specs:row.Specs,
                Qty:row.Qty,
                UniCostCC:row.UniCostCC,
                PilotSampleDRb:row.PilotSampleDRb,
                MIQPQty:row.MIQPQty,
                PackType:row.PackType,
                StationCode:row.StationCode,
                ReReferencedItemCode:row.ReReferencedItemCode
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
      {isError && (
                <p className={styles.errorMsg}>
                   {"message" in error ? error.message : "Failed to load users"}
                </p>
            )}
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
      {editingForm && (
      <Modal<EditableFormData>
        title="Edit Item"
        form={editingForm} 
        fields={poDetailField}
        schema={poDetainSchema}
        onClose={() => setEditingForm(null)}
        onSave={handleSaveEdit}
      />
    )}


      {addModal && (
        <Modal
          title="Add New Item"
          form={{
            IndentNo: "",
            VendorCode: "",
            OrderDate: "",
            OrderLineNo: "",
            ItemCode: "",
            ConsigneeCode: "",
            OrderLineDRB: "",
            Specs: "",
            Qty: "",
            UniCostCC: "",
            PilotSampleDRb: "",
            MIQPQty: "",
            PackType: "",
            StationCode: "",
            ReReferencedItemCode: "",
          }}
          fields={poDetailField}
          schema={poDetainSchema}
          onClose={() => setAddModal(false)}
          onSave={handleAdd}
        />
      )}

     
    </div>
  );
};

export default PoDetail;
