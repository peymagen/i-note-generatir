import styles from "./PasswordStrength.module.css";

interface Props {
  password: string;
}

const getStrength = (password: string) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  return score;
};

const PasswordStrength: React.FC<Props> = ({ password }) => {
  const score = getStrength(password);

  const labels = ["Very Weak", "Weak", "Okay", "Strong", "Very Strong"];

  return (
    <div className={styles.wrapper}>
      <div className={styles.bar}>
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`${styles.segment} ${score >= i ? styles.active : ""}`}
          />
        ))}
      </div>
      {password && (
        <small className={styles.label}>{labels[score - 1] || "Weak"}</small>
      )}
    </div>
  );
};

export default PasswordStrength;
