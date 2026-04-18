import React, { useState } from "react";
import useSWR from "swr";
import { Box, Typography } from "@mui/material";
import { ADMIN_COLOR } from "../admin.constants";
import { VTable } from "../../../../common/components/VTable";
import type { VTableColumn } from "../../../../common/components/VTable";
import { VAvatar } from "../../../../common/components/VAvatar";
import { VButton } from "../../../../common/components/VButton";
import { getAllUser } from "../../../../apis/users/user.api";
import type { User } from "../../../../apis/users/user.interface";
import type { PaginatedResponse } from "../../../../common/interfaces/base-requestdto.interface";
import dayjs from "dayjs";

interface CustomersTabProps {
  search: string;
}

const PAGE_SIZE = 10;

export const CustomersTab: React.FC<CustomersTabProps> = ({ search }) => {
  const [page, setPage] = useState(1);

  const swrKey = ["users", page, PAGE_SIZE, search];

  const { data: usersResp } = useSWR<PaginatedResponse<User>>(swrKey, () =>
    getAllUser({ page, limit: PAGE_SIZE, search }).then((r) => r.data),
  );

  const users = usersResp?.data ?? [];
  const total = usersResp?.meta?.total ?? usersResp?.pagination?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const avatarColors = [
    ADMIN_COLOR.accent,
    ADMIN_COLOR.blue,
    ADMIN_COLOR.green,
    ADMIN_COLOR.orange,
    ADMIN_COLOR.red,
  ];
  const getColor = (id: number) => avatarColors[id % avatarColors.length];

  const columns: VTableColumn<User>[] = [
    {
      key: "full_name",
      label: "Customer",
      render: (r) => (
        <VAvatar name={r.full_name} color={getColor(r.id)} size="small" />
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (r) => (
        <Typography sx={{ fontSize: 13, color: ADMIN_COLOR.dim }}>
          {r.email}
        </Typography>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      width: 150,
      render: (r) => (
        <Typography
          sx={{ fontFamily: "monospace", fontSize: 12, color: ADMIN_COLOR.dim }}
        >
          {r.phone || "—"}
        </Typography>
      ),
    },
    {
      key: "created_at",
      label: "Joined",
      width: 130,
      render: (r) => (
        <Typography sx={{ fontSize: 12, color: ADMIN_COLOR.dim }}>
          {r.created_at ? dayjs(r.created_at).format("MMM D, YYYY") : "—"}
        </Typography>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3.5 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 22,
              fontWeight: 800,
              color: ADMIN_COLOR.text,
              letterSpacing: -0.5,
            }}
          >
            Customers
          </Typography>
          <Typography sx={{ fontSize: 13, color: ADMIN_COLOR.dim, mt: 0.25 }}>
            {total} total users
          </Typography>
        </Box>
      </Box>

      <VTable<User> columns={columns} data={users} />

      {totalPages > 1 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 1,
            mt: 2,
          }}
        >
          <VButton
            variant="ghost"
            size="small"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Prev
          </VButton>
          <Typography sx={{ fontSize: 12, color: ADMIN_COLOR.dim }}>
            {page} / {totalPages}
          </Typography>
          <VButton
            variant="ghost"
            size="small"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </VButton>
        </Box>
      )}
    </Box>
  );
};
