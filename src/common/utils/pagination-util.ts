import type { Dispatch, SetStateAction } from "react";

export const handlePaginationChange = <
  T extends { params: Record<string, unknown> },
>(
  page: number,
  pageSize: number,
  setState: Dispatch<SetStateAction<T>>,
) => {
  setState((prev) => ({
    ...prev,
    params: {
      ...prev.params,
      skip: (page - 1) * pageSize,
      count: pageSize,
    },
  }));
};

/**
 * Calculate current page and page size from skip and count
 * @param skip
 * @param count
 */
export const getPaginationInfo = (skip: number = 0, count: number = 10) => {
  return {
    currentPage: Math.floor(skip / count) + 1,
    pageSize: count,
  };
};
