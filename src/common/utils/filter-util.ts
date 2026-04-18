import type { Dispatch, SetStateAction } from "react";

export const handleFilterChange = <
  T extends { params: Record<string, unknown> },
>(
  field: string,
  value: unknown,
  setState: Dispatch<SetStateAction<T>>,
) => {
  setState((prev) => ({
    ...prev,
    params: {
      ...prev.params,
      [field]: value,
      skip: 0,
    },
  }));
};
