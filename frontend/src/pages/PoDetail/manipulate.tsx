import { useForm, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Input from "../../component/Input/Input2"
import Button from "../../component/Button/Button";
import * as yup from "yup";
import { toast } from "react-toastify";
import { useUpdatePODataMutation,
  useAddPoDetailMutation,
} from "../../store/services/po-details";
import type{FormData,PoDetailItem} from "../../types/poDetail";
import { useEffect } from "react";


/* ---------------- TYPES ---------------- */

const poDetailSchema: yup.ObjectSchema<FormData> = yup.object({
  IndentNo: yup.string().required("Indent No is required"),
  VendorCode: yup.string().required("Vendor Code is required"),
  OrderDate: yup.string().required("Order Date is required"),
  OrderLineNo: yup.number().optional(),
  ItemCode: yup.string().required("Item Code is required"),
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

interface Props {
  mode: "create" | "edit";
  defaultValues?: PoDetailItem;
  onSubmitSuccess: () => void;
}

const Manipulate: React.FC<Props> = ({
  mode,
  defaultValues,
  onSubmitSuccess,
}) => {
  const {
    register,
    handleSubmit,
    // watch,
    // setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(poDetailSchema),
    defaultValues,
    context: { mode },
  });
    const [updatePoDetail] = useUpdatePODataMutation();
    const [addPoDetail] = useAddPoDetailMutation();

  useEffect(()=>{
    console.log("Default Values:", defaultValues);
  })

  const onSubmit: SubmitHandler<PoDetailItem> = async (data) => {
    console.log("Form Data Submitted:", data);
    try {
      // call create or update API here
      try {
        const mutation = mode === "create" ? addPoDetail : updatePoDetail;
        const payload: PoDetailItem = {
          IndentNo: data.IndentNo,
          VendorCode: data.VendorCode,
          OrderDate: data.OrderDate,
          OrderLineNo: data.OrderLineNo || 0,
          ItemCode: data.ItemCode,
          ConsigneeCode: data.ConsigneeCode || "",
          OrderLineDRB: data.OrderLineDRB || "",
          Specs: data.Specs || "",
          Qty: data.Qty || 0,
          UniCostCC: data.UniCostCC || 0,
          PilotSampleDRb: data.PilotSampleDRb || "",
          MIQPQty: data.MIQPQty || 0,
          PackType: data.PackType || "",
          StationCode: data.StationCode || "",
          ReReferencedItemCode: data.ReReferencedItemCode || "",
        };
        console.log("Payload before submission:", payload);
        if (mode === "edit") {
          payload.id = defaultValues?.id;
        }

        const response = await mutation(payload).unwrap();

        if (response?.data) {
          toast.success(mode === "create" ? "Vendor created" : "Vendor updated");
        }
      } 
      catch (err) {
        const error = err as { data?: { message?: string } };
        toast.error(error?.data?.message || "Failed. Please try again.");
      }

      onSubmitSuccess();
    } 
    catch {
      console.log("Data ID:", data.id);
      toast.error("Failed");
    }
  };


  return (
    <form onSubmit={handleSubmit(onSubmit)}>
    <Input
        label="Indent No"
        name="IndentNo"
        register={register}
        errors={errors}
        
        
    />
     <Input
        label="Indent No"
        name="IndentNo"
        register={register}
        errors={errors}
        required
    />
     <Input
        label="Vendor`Code"
        name="IndentNo"
        register={register}
        errors={errors}
        
        
    />
     <Input
        label="Order Date"
        name="OrderDate"
        register={register}
        errors={errors}
        
        
    />
     <Input
        label="Indent No"
        name="IndentNo"
        register={register}
        errors={errors}
        
        
    />
     <Input
        label="Order Line No"
        name="OrderLineNo"
        register={register}
        errors={errors}
        
        
    />
     <Input
        label="Indent No"
        name="IndentNo"
        register={register}
        errors={errors}
        
        
    />
     <Input
        label="Item Code"
        name="ItemCode"
        register={register}
        errors={errors}
        
        
    />
     <Input
        label="Consignee Code"
        name="ConsigneeCode"
        register={register}
        errors={errors}
        
    />
     <Input
        label="Order Line DRB"
        name="OrderLineDRB"
        register={register}
        errors={errors}
        
    />
    
      <Input
        label="Specs"
        name="Specs"
        register={register}
        errors={errors}
        
      />
      <Input
        label="Qty"
        name="Qty"
        register={register}
        errors={errors}
        
      />
      <Input
        label="UniCost CC"
        name="UniCostCC"
        register={register}
        errors={errors}
       
      />
    <Input
        label="PilotSampleDRb"
        name="PilotSampleDRb"
        register={register}
        errors={errors}
        
      />  
       <Input
        label="MIQPQty"
        name="MIQPQty"
        register={register}
        errors={errors}
        
      />  
       <Input
        label="PackType"
        name="PackType"
        register={register}
        errors={errors}
        
      />  
       <Input
        label="StationCode"
        name="StationCode"
        register={register}
        errors={errors}
        
      />  
       <Input
        label="ReReferencedItemCode"
        name="ReReferencedItemCode"
        register={register}
        errors={errors}
        
      />  
      
      <Button
        type="submit"
        label={isSubmitting ? "Saving..." : "Submit"}
        buttonType="one"
      />
    </form>
  );
};

export default Manipulate;
  