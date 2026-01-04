import Button from "../Button/Button";
import Modal from "../Modal";

interface Props {
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const ConfirmDialog: React.FC<Props> = ({
  title = "Confirm Action",
  message,
  onConfirm,
  onCancel,
  loading,
}) => {
  return (
    <Modal title={title} onClose={onCancel}>
      <p style={{ marginBottom: "1.5rem", color: "#334155" }}>{message}</p>

      <div
        style={{ display: "flex", justifyContent: "flex-end", gap: "0.8rem" }}
      >
        <Button label="Cancel" buttonType="danger_outline" onClick={onCancel} />
        <Button
          label={loading ? "Deleting..." : "Delete"}
          buttonType="danger"
          onClick={onConfirm}
          loading={loading}
        />
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
