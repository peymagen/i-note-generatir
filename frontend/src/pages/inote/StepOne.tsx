import { useForm, type SubmitHandler } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";

import Button from "../../component/Button/Button";
import Input from "../../component/Input/Input2";
import styles from "./Stepper.module.css";
import { useLazyGetIndentDateQuery } from "../../store/services/po-header";
import { useGetTitleQuery, useLazyGetContentQuery } from "../../store/services/page.api";
import type { formOne,StepperState } from "../../types/inote";



const Schema: yup.ObjectSchema<formOne> = yup.object({
  IndentNo: yup.string().required("Indent No is required"),
  OrderDate: yup.string().required("Order Date is required"),
  template: yup.string().required("Template is required"),
  sequenceNo: yup.number().required().default(0),
});


interface StepOneProps {
  // Added content string to the callback signature
  onNext: (formFields: formOne, dbData: StepperState["indentInfo"], content: string) => void;
  initialValues?: Partial<formOne>;
}

const StepOne: React.FC<StepOneProps> = ({ onNext, initialValues }) => {
  const { data: titleData, isLoading: isLoadingTitles } = useGetTitleQuery(undefined);
  const [triggerCheckPO, { isLoading: isCheckingPO }] = useLazyGetIndentDateQuery();
  
  // Use LAZY query so we can trigger it in onSubmit
  const [triggerGetContent, { isLoading: isFetchingContent }] = useLazyGetContentQuery();

  const titles = titleData?.data?.data || [];

  const { register, handleSubmit, formState: { errors } } = useForm<formOne>({
    resolver: yupResolver(Schema),
    defaultValues: {
      IndentNo: initialValues?.IndentNo || "",
      OrderDate: initialValues?.OrderDate || "",
      template: initialValues?.template || "",
      sequenceNo: initialValues?.sequenceNo || 0,
    },
  });

  const onSubmit: SubmitHandler<formOne> = async (data) => {
    try {
      // 1. Fetch both Indent Data and Template Content in parallel
      const [poResponse, contentResponse] = await Promise.all([
        triggerCheckPO({ IndentNo: data.IndentNo, OrderDate: data.OrderDate }).unwrap(),
        triggerGetContent(data.template).unwrap()
      ]);

      console.log("PO Response:", poResponse);
      if (poResponse.success ) {
        toast.success("Purchase Order and Content loaded!");
        
        const indentData = {
          header: Array.isArray(poResponse.data.header) ? poResponse.data.header : [poResponse.data.header],
          details: poResponse.data.details || []
        };
        // console.log("content:",contentResponse.data[0]);
        const content = contentResponse?.data[0] || "";

        onNext(data, indentData, content); 
      } else {
        console.error("No PO found:", poResponse);
        toast.error("No Purchase Order found.");
      }
    } catch (err: unknown) {
      if(err instanceof Error){
        console.error("Error fetching PO or Content:", err);
        toast.error(`Error: ${err.message}`);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.formContainer}>
      <h4>Basic Details</h4>
      <Input label="Indent No" name="IndentNo" register={register} errors={errors} />
      <Input label="Order Date" name="OrderDate" type="date" register={register} errors={errors} />

      <div className={styles.inputGroup}>
        <label className={styles.label}>Template</label>
        <select {...register("template")} className={styles.selectInput} disabled={isLoadingTitles}>
          <option value="">{isLoadingTitles ? "Loading..." : "Select a Template"}</option>
          {titles.map((t: string) => <option key={t} value={t}>{t}</option>)}
        </select>
        {errors.template && <p className={styles.errorText}>{errors.template.message}</p>}
      </div>

      <input type="hidden" {...register("sequenceNo")} />

      <Button
        type="submit"
        label={isCheckingPO || isFetchingContent ? "Verifying..." : "Next Step"}
        buttonType="one"
        disabled={isCheckingPO || isFetchingContent}
      />
    </form>
  );
};

export default StepOne;