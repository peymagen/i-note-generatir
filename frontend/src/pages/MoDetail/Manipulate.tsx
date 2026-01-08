import { useForm, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Input from "../../component/Input/Input2"
// import RichTextEditor from "../../component/RichEditor/RichEditor";
import Button from "../../component/Button/Button";
import * as yup from "yup";
import { toast } from "react-toastify";
import {  useUpdateMoDetailMutation,
  useAddMoDetailMutation,} from "../../store/services/mo-detail";

import type { FormData ,MoItem} from "../../types/mo";


/* ---------------- TYPES ---------------- */

const moSchema = yup.object({
  MoCPRO: yup.string().required("MO / CPRO is required"),
  MoAddress: yup.string().required("MO Address is required"),
});

interface Props {
  mode: "create" | "edit";
  defaultValues?: MoItem;
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
    resolver: yupResolver(moSchema),
    defaultValues,
    context: { mode },
  });
    const [updateMoDetail] = useUpdateMoDetailMutation();
    const [addMoDetail] = useAddMoDetailMutation();

  

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      // call create or update API here
      try {
        const mutation = mode === "create" ? addMoDetail : updateMoDetail;
        const payload: MoItem = {
          MoCPRO: data.MoCPRO,
          MoAddress: data.MoAddress,
        };
        if (mode === "edit") {
          payload.id = defaultValues?.id;
        }

        const response = await mutation(payload).unwrap();

        if (response?.data) {
          toast.success(mode === "create" ? "Vendor created" : "Vendor updated");
        }
      } catch (err) {
        const error = err as { data?: { message?: string } };
        toast.error(error?.data?.message || "Failed. Please try again.");
      }

      onSubmitSuccess();
    } catch {
      toast.error("Failed");
    }
  };


  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Mo CPRO"
        name="MoCPRO"
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
        label="Mo Address"
        name="MoAddress"
        register={register}
        errors={errors}
        required
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
  