import React, { useState } from "react";
import StepOne from "./StepOne";
import { Check, Lock } from "lucide-react";
import StepTwo from "./StepTwo";
import type { formData, StepperState, formOne } from "../../types/inote";
import * as detail from "../../types/poDetail";
import * as header from "../../types/poHeader";
import StepThree from "./StepThree";
import { useUpdateQtyFullFillMutation } from "../../store/services/po-details";
import styles from "./Stepper.module.css";

interface StepperFormProps {
  onComplete: (finalState: StepperState) => void;
}

const steps = [
  { label: "Inspection Basis", icon: <Check size={16} /> },
  { label: "Inspection Details", icon: <Lock size={16} /> },
];

const StepperForm: React.FC<StepperFormProps> = ({ onComplete }) => {
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
    setCurrentStep(2);
  };
  const [updateAvaailableQty] = useUpdateQtyFullFillMutation();

  const handleStepTwoComplete = (stepTwoFields: Partial<formData>) => {
    // Create the final snapshot of the data
    const updatedState: StepperState = {
      ...masterState,
      user: { ...masterState.user, ...stepTwoFields },
    };

    setMasterState(updatedState);
    setCurrentStep(3);
    // onComplete(updatedState);
  };

  const handleStepThreeComplete = async (
    products: StepperState["products"]
  ) => {
    console.log("Products from Step Three:", { products: products });
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
          onBack={() => setCurrentStep(1)}
          onFinish={handleStepTwoComplete}
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
