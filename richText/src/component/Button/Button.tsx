// import styles from "./Button.module.css";

// interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
//   label: string;
//   loading?: boolean;
//   buttonType?: "one" | "two" | "three"; 
// }

// const Button: React.FC<Props> = ({ label, loading, buttonType = "one", ...rest }) => {
//   return (
//     <button
//       className={`${styles.btn} ${styles[buttonType]}`}
//       disabled={loading || rest.disabled}
//       {...rest}
//     >
//       {loading ? "Please wait..." : label}
//     </button>
//   );
// };

// export default Button;




// import React from "react";
// import styles from "./Button.module.css";

// interface Props {
//   label: string;
//   loading?: boolean;
//   buttonType?: "one" | "two" | "three"| "four";
//   onClick?: ()=>void;
//   type?: "button" | "submit" | "reset";
//   disabled?: boolean;
// }

// const Button: React.FC<Props> = ({ label, loading, buttonType = "one", onClick, type="button", disabled }) => {
//   return (
//     <button
//       className={`${styles.btn} ${styles[buttonType]}`}
//       disabled={loading || disabled}
//       onClick={onClick}
//       type={type}
//     >
//       {loading ? "Please wait..." : label}
//     </button>
//   );
// };

// export default Button;




import React from "react";
import styles from "./Button.module.css";

interface Props {
  label: string;
  loading?: boolean;
  buttonType?: "one" | "two" | "three" | "four"|'five';
  onClick?: (e: React.MouseEvent) => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

const Button: React.FC<Props> = ({
  label,
  loading = false,
  buttonType = "one",
  onClick,
  type = "button",
  disabled = false,
}) => {
  return (
    <button
      className={`${styles.btn} ${styles[buttonType]}`}
      disabled={loading || disabled}
      onClick={onClick}
      type={type}
    >
      {loading ? label : label}
    </button>
  );
};

export default Button;

