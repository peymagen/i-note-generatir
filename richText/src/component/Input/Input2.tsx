import {
  type UseFormRegister,
  type FieldValues,
  type FieldErrors,
  type Path,
} from "react-hook-form";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import styles from "./Input.module.css";

interface InputProps<T extends FieldValues>
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: Path<T>;
  register?: UseFormRegister<T>;
  errors?: FieldErrors<T>;
  required?: boolean;
  fullWidth?: boolean;
  accept?: string;
  min?: string;
  max?: string;
}

const Input = <T extends FieldValues>({
  label,
  name,
  type = "text",
  register,
  errors,
  required = false,
  fullWidth = false,
  accept,
  min = "",
  max = "",
  placeholder,
  className = "",
  ...rest
}: InputProps<T>) => {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const finalType = isPassword && show ? "text" : type;

  const error = errors?.[name];

  return (
    <div className={`${styles.formGroup} ${className} ${fullWidth ? styles.fullWidth : ""}`}>
      <label htmlFor={name} className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>

      <div className={styles.inputWrapper}>
        <input
          id={name}
          type={finalType}
          accept={accept}
          min={min}
          max={max}
          placeholder={placeholder}
          className={`${styles.input} ${error ? styles.inputError : ""}`}
          {...(register ? register(name, { required }) : {})}
          {...rest}
        />

        {/* {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className={styles.eyeIcon}
            aria-label={show ? "Hide Password" : "Show Password"}
          >
            {show ? <FaEyeSlash /> : <FaEye />}
          </button>
        )} */}
        {isPassword && (
          <span
            onClick={() => setShow(!show)}
            className={styles.eyeIcon}
            role="button"
            tabIndex={0}
            aria-label={show ? "Show Password" : "Hide Password"}
          >
            {show ? <FaEye /> : <FaEyeSlash />}
          </span>
        )}

      </div>

      {error && (
        <p className={styles.errorMessage}>
          {String(error?.message ?? "Invalid input")}
        </p>
      )}

    </div>
  );
};

export default Input;
