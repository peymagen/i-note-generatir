import React, { useState } from "react";
import StepOne from "./StepOne";
import { Check, Lock } from "lucide-react";
import StepTwo from "./StepTwo";
import type { formData, StepperState, formOne, VendorFormData, MoFormData,iNote } from "../../types/inote";
import * as detail from "../../types/poDetail";
import * as header from "../../types/poHeader";
// import * as vendor from "../../types/vendor";
// import * as mo from "../../types/mo";
import StepThree from "./StepThree";
import { useUpdateQtyFullFillMutation } from "../../store/services/po-details";
import styles from "./Stepper.module.css";

interface StepperFormProps {
  onComplete: (finalState: StepperState) => void;
}

const steps = [
  { label: "Inspection Basis", icon: <Check size={16} /> },
  { label: "Inspection Details", icon: <Lock size={16} /> },
  { label: "Pproduct Details", icon: <Lock size={16} /> },
];


const extractFromParens = (str: string | null | undefined) => {
  const match = str?.match(/\((.*?)\)/);
  return match ? match[1] : str;
};

const StepperForm: React.FC<StepperFormProps> = ({ onComplete }) => {
  const[vendorCode,setVendorCode]=useState<string>("")
  const[consigneeCode,setConsigneeCode]=useState<string>("")
  const [currentStep, setCurrentStep] = useState(1);
  const [masterState, setMasterState] = useState<StepperState>({
    user: {
      IndentNo: "",
      OrderDate: "",
      template: "",
      sequenceNo: 0,
      date: "",
      InspectionOfferedDate: "",
      InspectedOn: "",
    },
    content: "",
    indentInfo: { header: [], details: [] },
    info: { vendor: [] , mo: []},
    products: [],
  });

  const handleStepOneComplete = (
    formFields: formOne,
    dbData: { header: header.FormData[]; details: detail.FormData[] },
    content: string
  ) => {
    setMasterState((prev) => ({
      ...prev,
      user: { ...prev.user, ...formFields },
      content: content,
      indentInfo: dbData,
    }));
    setConsigneeCode(extractFromParens(dbData.details[0]?.ConsigneeCode) || "");
    // console.log("Consignee Code in StepperForm:",consigneeCode);
    setVendorCode(dbData.header[0]?.VendorCode || "");
    // console.log("Vendor Code in StepperForm:",vendorCode);
    setCurrentStep(2);
  };
  const [updateAvaailableQty] = useUpdateQtyFullFillMutation();

  const handleStepTwoComplete = (
    stepTwoFields: Partial<formData>,
    dbData?: { vendor: VendorFormData[]; mo: MoFormData[]; iNote: iNote }
  ) => {
    setMasterState((prev) => ({
      ...prev,
      user: { ...prev.user, ...stepTwoFields },
      info:{
        vendor:dbData?.vendor || [],
        mo:dbData?.mo || [],
        iNote: dbData?.iNote
      }
    }));
    // console.log("Master",masterState);
    setCurrentStep(3);
    // onComplete(updatedState);
  };

  const handleStepThreeComplete = async (
    products: StepperState["products"]
  ) => {
    // console.log("Products from Step Three:", { products: products });
    const finalState = {
      ...masterState,
      products,
    };
    const updatePromises = await updateAvaailableQty({
      products: products,
    }).unwrap();
    console.log("Update Promises:", updatePromises);
    console.log("Final State to be sent on completion:", finalState);
    setMasterState(finalState);
    onComplete(finalState);
  };

  return (
    <div className={styles.stepperFormContainer}>
      <div className={styles.stepperWrapper}>
        {steps.map((step, index) => {
          const isCompleted = currentStep > index + 1;
          const isActive = currentStep === index + 1;

          return (
            <React.Fragment key={index}>
              {/* Step Circle and Label */}
              <div className={styles.stepItem}>
                <div
                  className={`${styles.circle} ${
                    isCompleted
                      ? styles.completed
                      : isActive
                      ? styles.active
                      : styles.upcoming
                  }`}
                >
                  {isCompleted ? <Check size={18} /> : step.icon}
                </div>
                <div className={styles.labelWrapper}>
                  <span className={styles.stepText}>STEP {index + 1}</span>
                  <span className={styles.labelText}>{step.label}</span>
                </div>
              </div>

              {/* Connecting Line (don't show after the last step) */}
              {index < steps.length - 1 && (
                <div className={styles.lineWrapper}>
                  <div
                    className={`${styles.line} ${
                      isCompleted
                        ? styles.lineCompleted
                        : isActive
                        ? styles.lineHalf
                        : ""
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {currentStep === 1 && (
        <StepOne
          initialValues={masterState.user}
          onNext={handleStepOneComplete}
        />
      )}

      {currentStep === 2 && (
        <StepTwo
          initialValues={masterState.user}
          indentInfo={masterState.indentInfo}
          vendorCode={vendorCode}
          consigneeCode={consigneeCode}
          onBack={() => setCurrentStep(1)}
          onNext={handleStepTwoComplete}
        />
      )}

      {currentStep === 3 && (
        <StepThree
          initialValues={masterState.user}
          onBack={() => setCurrentStep(2)}
          onFinish={handleStepThreeComplete}
        />
      )}
    </div>
  );
};

export default StepperForm;
