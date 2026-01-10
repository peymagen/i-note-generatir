import React, { useState } from "react";
import StepOne from "./StepOne";
import { Check, Lock } from "lucide-react"; 
import StepTwo from "./StepTwo";
import type { formData, StepperState, formOne } from "../../types/inote";
import * as detail from "../../types/poDetail";
import * as header from "../../types/poHeader";
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
      IndentNo: "", OrderDate: "", template: "", sequenceNo: 0,
      date: "", InspectionOfferedDate: "", InspectedOn: ""
    },
    content: "",
    indentInfo: { header: [], details: [] }
  });
  console.log("Master State:", masterState);
  const handleStepOneComplete = (
    formFields: formOne, 
    dbData: { header: header.FormData[], details: detail.FormData[] },
    content: string
  ) => { 
    setMasterState((prev) => ({
      ...prev,
      user: { ...prev.user, ...formFields },
      content: content,
      indentInfo: dbData
    }));
    setCurrentStep(2);
  };

  const handleStepTwoComplete = (stepTwoFields: Partial<formData>) => {
    // Create the final snapshot of the data
    const updatedState: StepperState = {
      ...masterState,
      user: { ...masterState.user, ...stepTwoFields }
    };
    
   
    setMasterState(updatedState);
    onComplete(updatedState); 
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
                  isCompleted ? styles.completed : isActive ? styles.active : styles.upcoming
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
                    isCompleted ? styles.lineCompleted : isActive ? styles.lineHalf : ""
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
    </div>
  );
};

export default StepperForm;





// import React from "react";
// import { Check, Lock, Grid3X3 } from "lucide-react"; 
// import styles from "./Stepper.module.css";

// interface StepperIndicatorProps {
//   currentStep: number;
//   totalSteps: number;
// }



// const StepperIndicator: React.FC<StepperIndicatorProps> = ({ currentStep, totalSteps }) => {
//   return (
    
//   );
// };

// export default StepperIndicator;