import { useForm, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Input from "../../component/Input/Input2"
// import RichTextEditor from "../../component/RichEditor/RichEditor";
import Button from "../../component/Button/Button";
import * as yup from "yup";
import { toast } from "react-toastify";
import { useUpdateVendorMutation ,
    useAddVendorMutation
} from "../../store/services/vendor-detail";

import type { FormData ,VendorItem} from "../../types/vendor";
import { useEffect } from "react";

/* ---------------- TYPES ---------------- */

const vendorSchema: yup.ObjectSchema<FormData> = yup.object({
  FirmName: yup.string().required("Firm Name is required"),
  FirmAddress: yup.string().required("Firm Address is required"),
  vendorCode: yup.string().required("Vendor Code is required"),
  FirmEmailId: yup.string().optional(),
  ContactNumber: yup.string().optional(),
});

interface Props {
  mode: "create" | "edit";
  defaultValues?: VendorItem;
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
    resolver: yupResolver(vendorSchema),
    defaultValues,
    context: { mode },
  });
    const [updateVendor] = useUpdateVendorMutation();
    const [addVendor] = useAddVendorMutation();

  useEffect(()=>{
    console.log("Default Values:", defaultValues);
  })

  const onSubmit: SubmitHandler<VendorItem> = async (data) => {
    console.log("Form Data Submitted:", data);
    try {
      // call create or update API here
      try {
        const mutation = mode === "create" ? addVendor : updateVendor;
        const payload: VendorItem = {
          FirmName: data.FirmName,
          FirmAddress: data.FirmAddress,
          vendorCode: data.vendorCode,
          FirmEmailId: data.FirmEmailId || "",
          ContactNumber: data.ContactNumber ||"",
        };
        console.log("Payload before submission:", payload);
        if (mode === "edit") {
          payload.Id = defaultValues?.Id;
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
      console.log("Data ID:", data.Id);
      toast.error("Failed");
    }
  };


  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="FirmName"
        name="FirmName"
        register={register}
        errors={errors}
        required
      />
      {/* <RichTextEditor
        label="Firm Address"
        name="FirmAddress"
        watch={watch}
        setValue={setValue}
        errors={errors}
        onEditorReady={(editor) => {
        editorInstanceRef.current = editor;
        }}
        required
      /> */}
      <Input
        label="FirmAddress"
        name="FirmAddress"
        register={register}
        errors={errors}
        required
      />
      <Input
        label="vendorCode"
        name="vendorCode"
        register={register}
        errors={errors}
        required
      />
      <Input
        label="FirmEmailId"
        name="FirmEmailId"
        register={register}
        errors={errors}
       
      />
    <Input
        label="ContactNumber"
        name="ContactNumber"
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
  