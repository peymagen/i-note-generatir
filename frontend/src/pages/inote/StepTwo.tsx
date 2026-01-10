import React from "react";
import { useForm, type SubmitHandler, type Resolver } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";

import Button from "../../component/Button/Button";
import Input from "../../component/Input/Input2";
import styles from "./Stepper.module.css";
import type { formData, formTwo, StepperState } from "../../types/inote";

interface StepTwoProps {
  onFinish: (data: Partial<formData>) => void;
  onBack: () => void;
  initialValues: formData;
  indentInfo: StepperState["indentInfo"];
}


const dateRangeRegex = /^(\d{1,2}\/\d{1,2}\/\d{2,4})-(\d{1,2}\/\d{1,2}\/\d{2,4})$/;

const Schema: yup.ObjectSchema<formTwo> = yup.object({
  sequenceNo: yup
    .number()
    .typeError("Must be a number")
    .required("Required"),
  date: yup.string().required("Required"),
  InspectedOn: yup.string().required("Required"), 
  
  InspectionOfferedDate: yup
    .string()
    .required("Required")
    .matches(
      dateRangeRegex,
      "Use format DD/MM/YY-DD/MM/YY (e.g., 02/1/26-01/02/26)"
    ),
});

const StepTwo: React.FC<StepTwoProps> = ({ 
  onFinish, 
  onBack, 
  initialValues, 
  indentInfo 
}) => {
  const headerData = indentInfo.header[0];
  console.log("Header Data in Step Two:", headerData);

  const { register, handleSubmit, formState: { errors } } = useForm<formData>({
    resolver: yupResolver(Schema) as unknown as Resolver<formData>, 
    defaultValues: initialValues,
  });

  const onSubmit: SubmitHandler<formData> = (data) => {
    onFinish(data); 
    toast.success("Preparing I-Note editor...");
  };

  return (
    <div className={styles.formContainer}>
      {/* {headerData && (
        <div className={styles.infoBox}>
          <h4>Inspection Basis</h4>
          <p><strong>Vendor:</strong> {headerData.Name}</p>
          <p><strong>PO No:</strong> {initialValues.IndentNo}</p>
        </div>
      )} */}

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <h3 className={styles.stepTitle}>Inspection Details</h3>

        <Input 
          label="Sequence No" 
          name="sequenceNo" 
          type="number" 
          register={register} 
          errors={errors} 
        />

        <Input 
          label="Inspection Date" 
          name="date" 
          type="date" 
          register={register} 
          errors={errors} 
        />

        
        <Input 
          label="Offered Date (Range)" 
          name="InspectionOfferedDate" 
          type="text" 
          placeholder="e.g. 02/1/26-01/02/26"
          register={register} 
          errors={errors} 
        />

        
        <Input 
          label="Inspected On" 
          name="InspectedOn" 
          type="date" 
          register={register} 
          errors={errors} 
        />

        <div className={styles.buttonGroup}>
          <Button 
            type="button" 
            label="Back" 
            onClick={onBack} 
            buttonType="one" 
          />
          <Button 
            type="submit" 
            label="Generate I-Note" 
            buttonType="one" 
          />
        </div>
      </form>
    </div>
  );
};

export default StepTwo;