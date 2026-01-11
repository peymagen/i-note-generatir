import React from "react"; 
import { useForm, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import Input from "../../component/Input/Input2";
import Button from "../../component/Button/Button";
import { 
  useUpdatePOHeaderMutation, 
  useAddPoHeaderMutation 
} from "../../store/services/po-header";
import type { FormData, PoHeaderItem } from "../../types/poHeader";

/* ---------------- VALIDATION SCHEMA ---------------- */


const poHeaderSchema: yup.ObjectSchema<FormData> = yup.object({
  IndentNo: yup.string().optional(),
  VendorCode: yup.string().optional(),
  OrderDate: yup.string().optional(),
  ValueRs: yup.string().optional(),
  InspectingAgencyType: yup.string().optional(),
  InspectorCode: yup.string().optional(),
  InspectionSiteCode: yup.string().optional(),
  Remarks: yup.string().optional(),
  // Numbers need a transform to handle empty strings from inputs
  QuoteKey: yup.number().transform((value) => (isNaN(value) ? undefined : value)).optional(),
  SelectedQuoteDate: yup.string().optional(),
  DateTimeApproved: yup
  .string()
  .transform((value) => (value === null || value === "" ? undefined : value))
  .optional(),
  ApprovedBy: yup.string().optional(),
  TypeClosing: yup.string().optional(),
  DateCloded: yup.string().optional(),
  ClosedBy: yup.string().optional(),
  PackingInstruction: yup.string().optional(),
  DespatchInstruction: yup.string().optional(),
  InspectionInstruction: yup.string().optional(),
  StationCode: yup.string().optional(),
  Remarks1: yup.string().optional(),
  Name: yup.string().optional(),
  City: yup.string().optional(),
  State: yup.string().optional(),
});

interface Props {
  mode: "create" | "edit";
  defaultValues?: PoHeaderItem;
  onSubmitSuccess: () => void;
}

const Manipulate: React.FC<Props> = ({ mode, defaultValues, onSubmitSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(poHeaderSchema),
    defaultValues,
  });

  const [updatePoHeader] = useUpdatePOHeaderMutation();
  const [addPoHeader] = useAddPoHeaderMutation();

  
 

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    console.log("Form Data Submitted:", data);
    try {
      const mutation = mode === "create" ? addPoHeader : updatePoHeader;
      
      // Combine form data with ID for edits
    //   const payload: PoHeaderItem = {
    //     ...data,
    //     id: mode === "edit" ? defaultValues?.id : undefined,
    //   };
        const payload: PoHeaderItem = {
          IndentNo: data.IndentNo,
          VendorCode: data.VendorCode,
          OrderDate: data.OrderDate || "",
          ValueRs: data.ValueRs,
          InspectingAgencyType: data.InspectingAgencyType,
          InspectorCode: data.InspectorCode,
          InspectionSiteCode: data.InspectionSiteCode,
            Remarks: data.Remarks,
            QuoteKey: data.QuoteKey,  
            SelectedQuoteDate: data.SelectedQuoteDate,
            DateTimeApproved: data.DateTimeApproved || "", 
            ApprovedBy: data.ApprovedBy, 
            TypeClosing: data.TypeClosing,  
            DateCloded: data.DateCloded,  
            ClosedBy: data.ClosedBy, 
            PackingInstruction: data.PackingInstruction,
            DespatchInstruction: data.DespatchInstruction,
            InspectionInstruction: data.InspectionInstruction,
            StationCode: data.StationCode,
            Remarks1: data.Remarks1,
            Name: data.Name,
            City: data.City,
            State: data.State,
        }
        if (mode === "edit") {
          payload.id = defaultValues?.id;
        }
      await mutation(payload).unwrap();

      toast.success(mode === "create" ? "PO Header created successfully" : "PO Header updated successfully");
      onSubmitSuccess();
    } catch (err) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Operation failed. Please try again.");
      console.error("Submission Error:", err);
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
        label="ValueRs"
        name="ValueRs"
        register={register}
        errors={errors}
       
      />
    <Input
        label="Inspecting Agency Type"
        name="InspectingAgencyType"
        register={register}
        errors={errors}
        
      /> 
      <Input
        label="InspectorCode"
        name="InspectorCode"
        register={register}
        errors={errors}
        
      /> 
      <Input
        label="InspectionSiteCode"
        name="InspectionSiteCode"
        register={register}
        errors={errors}
        
      /> 
      <Input
        label="Remarks"
        name="Remarks"
        register={register}
        errors={errors}
        
      />
       <Input
        label="Quote Key"
        name="QuoteKey"
        register={register}
        errors={errors}
        
      />
       <Input
        label="Selected QuoteDate"
        name="SelectedQuoteDate"
        register={register}
        errors={errors}
        
      /> 
      <Input
        label="DateTimeApproved"
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
        label="TypeClosing"
        name="TypeClosing"
        register={register}
        errors={errors}
        
      /> 
      <Input
        label="DateCloded"
        name="DateCloded"
        register={register}
        errors={errors}
        
      /> 
      <Input
        label="ClosedBy"
        name="ClosedBy"
        register={register}
        errors={errors}
        
      /> 
      <Input
        label="Packing Instruction"
        name="PackingInstruction"
        register={register}
        errors={errors}
        
      />
       <Input
        label="Despatch Instruction"
        name="DespatchInstruction"
        register={register}
        errors={errors}
        
      />  <Input
        label="Inspection Instruction"
        name="InspectionInstruction"
        register={register}
        errors={errors}
        
      />  <Input
        label="Station Code"
        name="StationCode"
        register={register}
        errors={errors}
        
      />  <Input
        label="Remarks1"
        name="Remarks1"
        register={register}
        errors={errors}
        
      />  <Input
        label="Name"
        name="Name"
        register={register}
        errors={errors}
        
      />  <Input
        label="City"
        name="City"
        register={register}
        errors={errors}
        
      />  <Input
        label="State"
        name="State"
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