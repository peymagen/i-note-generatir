import { useForm, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Input from "../../component/Input/Input2"
import Button from "../../component/Button/Button";
import * as yup from "yup";
import { toast } from "react-toastify";
import { useUpdateItemDetailMutation,
  useAddItemDetailMutation,
} from "../../store/services/item-details";
import type { FormData ,itemDetail} from "../../types/itemDetail";
import { useEffect } from "react";


/* ---------------- TYPES ---------------- */

const itemSchema: yup.ObjectSchema<FormData> = yup.object({
  IndentNo: yup.string().optional(),
  VendorCode: yup.string().optional(),
  OrderDate: yup.string().optional(),
  OrderLineNo: yup.number().transform((value) => (isNaN(value) ? undefined : value)).optional(),
  ItemCode: yup.string().optional(),
  SectionHead: yup.string().optional(),
  ItemDesc: yup.string().optional(),
  CountryCode: yup.string().optional(), 
    ItemDeno: yup.string().optional(),
  MonthsShelfLife: yup.number().transform((value) => (isNaN(value) ? undefined : value)).optional(),
  CRPCategory: yup.string().optional(),
  VEDCCategory: yup.string().optional(),
  ABCCategory: yup.string().optional(),
  DateTimeApproved: yup.string().optional(),
  ApprovedBy: yup.string().optional(),
  ReviewSubSectionCode: yup.string().optional(),
  INCATYN: yup.string().optional(),
});

interface Props {
  mode: "create" | "edit";
  defaultValues?: itemDetail;
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
    resolver: yupResolver(itemSchema),
    defaultValues,
    context: { mode },
  });
    const [updateItemDetail] = useUpdateItemDetailMutation();
    const [addItemDetail] = useAddItemDetailMutation();

  useEffect(()=>{
    console.log("Default Values:", defaultValues);
  })

  const onSubmit: SubmitHandler<itemDetail> = async (data) => {
    console.log("Form Data Submitted:", data);
    try {
      // call create or update API here
      try {
        const mutation = mode === "create" ? addItemDetail : updateItemDetail;
        const payload: itemDetail = {
          IndentNo: data.IndentNo,
          VendorCode: data.VendorCode,
          OrderDate: data.OrderDate,
          OrderLineNo: data.OrderLineNo,
          ItemCode: data.ItemCode,
          SectionHead: data.SectionHead,
          ItemDesc: data.ItemDesc,
          CountryCode: data.CountryCode,
          ItemDeno: data.ItemDeno,
          MonthsShelfLife: data.MonthsShelfLife,
          CRPCategory: data.CRPCategory,
          VEDCCategory: data.VEDCCategory,
          ABCCategory: data.ABCCategory,
          DateTimeApproved: data.DateTimeApproved,
          ApprovedBy: data.ApprovedBy,
          ReviewSubSectionCode: data.ReviewSubSectionCode,
          INCATYN: data.INCATYN || "",
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
        label="Vendor Code"
        name="VendorCode"
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
        label="Order Line No"
        name="OrderLineNo"
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
        label="Secion Head"
        name="SectionHead"
        register={register}
        errors={errors}
        
      />
      <Input
        label="Item Description"
        name="ItemDesc"
        register={register}
        errors={errors}
        
      />
      <Input
        label="Country Code"
        name="CountryCode"
        register={register}
        errors={errors}
        
      />
      <Input
        label="Item Deno"
        name="ItemDeno"
        register={register}
        errors={errors}
       
      />
    <Input
        label="Months Shelf Life"
        name="MonthsShelfLife"
        register={register}
        errors={errors}
        
      /> 
       <Input
        label="CRP Category"
        name="CRPCategory"
        register={register}
        errors={errors}
        
      />
      <Input
        label="ABC Category"
        name="ABCCategory"
        register={register}
        errors={errors}
        
      />
      <Input
        label="Date Time Approved"
        name="DateTimeApproved"
        register={register}
        errors={errors}
        
      />
      <Input
        label="Approved By"
        name="ApprovedBy"
        register={register}
        errors={errors}
       
      />
    <Input
        label="Review Sub Section Code"
        name="ReviewSubSectionCode"
        register={register}
        errors={errors}
        
      /> 
      <Input
        label="INCATYN"
        name="INCATYN"
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
  