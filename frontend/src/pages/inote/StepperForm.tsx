import React, { useState } from "react";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import type { formData, StepperState, formOne } from "../../types/inote";
import * as detail from "../../types/poDetail";
import * as header from "../../types/poHeader";

interface StepperFormProps {
  onComplete: (finalState: StepperState) => void;
}

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
    <div>
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