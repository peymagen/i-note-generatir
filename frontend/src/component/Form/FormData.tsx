import type { ChangeEvent } from "react";
import React from "react";
import Input from "../Input/Input2";
import type { FormProps } from "../../types/formTypes";

export default function FormData({ formData, setFormData }: FormProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div 
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr", 
        gap: "20px"
      }}
    >
      {Object.keys(formData).map((key) => (
        <Input
          key={key}
          label={key}
          name={key}
          value={formData[key]}
          onChange={handleChange}
          fullWidth
          placeholder={`Enter ${key}`}
        />
      ))}
    </div>
  );
}
