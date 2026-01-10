import React, { useState } from "react";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import type { formData, StepperState, formOne } from "../../types/inote";
import * as detail from "../../types/poDetail";
import * as header from "../../types/poHeader";
import StepThree from "./StepThree";
import { useUpdateQtyFullFillMutation } from "../../store/services/po-details";

interface StepperFormProps {
  onComplete: (finalState: StepperState) => void;
}

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
