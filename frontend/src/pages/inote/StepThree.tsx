import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import Button from "../../component/Button/Button";
import styles from "./Stepper.module.css";
import type { formOne, ProductItem } from "../../types/inote";
import { useGetItemsIndentQuery } from "../../store/services/item-details";
import type { PoDetailItem } from "../../types/poDetail";

interface StepThreeProps {
  initialValues?: Partial<formOne>;
  onFinish: (products: ProductItem[]) => void;
  onBack: () => void;
}

/* ---------------------------------------------------------
 * LOCAL UI STATE TYPE
 * ------------------------------------------------------- */
type ProductUIState = {
  selected: boolean;
  acceptedQty: number;
};

const StepThree: React.FC<StepThreeProps> = ({
  initialValues,
  onFinish,
  onBack,
}) => {
  /* ---------------------------------------------------------
   * API DATA
   * ------------------------------------------------------- */
  const { data, isLoading, isError } = useGetItemsIndentQuery({
    indentNo: initialValues?.IndentNo || "",
    orderDate: initialValues?.OrderDate || "",
  });

  /* ---------------------------------------------------------
   * USER INTERACTION STATE (ONLY)
   * ------------------------------------------------------- */
  const [uiState, setUiState] = useState<Record<number, ProductUIState>>({});

  /* ---------------------------------------------------------
   * PURE DERIVED PRODUCTS (NO STATE)
   * ------------------------------------------------------- */
  const products = useMemo<ProductItem[]>(() => {
    if (!data?.data?.data) return [];

    return data.data.data.map(
      (p: PoDetailItem & { ItemDesc: string; DetailId: number }) => {
        const ui = uiState[p?.DetailId] ?? {
          selected: false,
          acceptedQty: 0,
        };

        return {
          id: p.DetailId,
          name: `${p.ItemCode} - ${p.ItemDesc}`,
          availableQty: p.Qty,
          selected: ui.selected,
          acceptedQty: ui.acceptedQty,
        };
      }
    );
  }, [data, uiState]);

  /* ---------------------------------------------------------
   * HANDLERS
   * ------------------------------------------------------- */
  const toggleSelect = (id: number) => {
    setUiState((prev) => ({
      ...prev,
      [id]: {
        selected: !prev[id]?.selected,
        acceptedQty: prev[id]?.acceptedQty ?? 0,
      },
    }));
  };

  const updateQty = (id: number, value: number, max: number) => {
    setUiState((prev) => ({
      ...prev,
      [id]: {
        selected: true,
        acceptedQty: Math.min(value, max),
      },
    }));
  };

  const handleFinish = () => {
    const source = data?.data?.data ?? [];

    const selectedProducts = source
      .map((p: PoDetailItem & { ItemDesc: string; DetailId: number }) => {
        const ui = uiState[p.DetailId];
        if (!ui || !ui.selected || ui.acceptedQty <= 0) return null;

        return {
          ...p, // ✅ full backend detail
          acceptedQty: ui.acceptedQty, // ✅ UI data
          selected: true,
        };
      })
      .filter(Boolean);

    if (!selectedProducts.length) {
      toast.error("Select at least one product with quantity");
      return;
    }

    onFinish(selectedProducts);
    toast.success("Products added successfully!");
  };

  /* ---------------------------------------------------------
   * ERROR
   * ------------------------------------------------------- */
  if (isError) {
    toast.error("Failed to load products");
  }

  /* ---------------------------------------------------------
   * RENDER
   * ------------------------------------------------------- */
  return (
    <div className={styles.formContainer}>
      <h3 className={styles.stepTitle}>Step 3: Product Inspection</h3>

      {isLoading ? (
        <p>Loading products...</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Select</th>
              <th>Product</th>
              <th>Available Qty</th>
              <th>Accepted Qty</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={p.selected}
                    onChange={() => toggleSelect(p.id)}
                  />
                </td>
                <td>{p.name}</td>
                <td>{p.availableQty}</td>
                <td>
                  <input
                    type="number"
                    min={0}
                    max={p.availableQty}
                    disabled={!p.selected}
                    value={p.acceptedQty}
                    onChange={(e) =>
                      updateQty(p.id, Number(e.target.value), p.availableQty)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className={styles.buttonGroup}>
        <Button type="button" label="Back" onClick={onBack} />
        <Button type="button" label="Finish" onClick={handleFinish} />
      </div>
    </div>
  );
};

export default StepThree;
