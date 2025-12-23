import React from "react";
import styles from "./Layout.module.css";


interface Props {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}

const Auth: React.FC<Props> = ({ title, subtitle, children, fullWidth = false }) => {
  return (
    <div className={`${styles.container} ${fullWidth ? styles.fullWidth : ''}`}>
      {subtitle && <h1 className={styles.subtitle}>{subtitle}</h1>}
      <div className={`${styles.card} ${fullWidth ? styles.fullWidthCard : ''}`}>
        {title && <h1 className={styles.title}>{title}</h1>}
        {children}
      </div>
    </div>
  );
};

export default Auth;
