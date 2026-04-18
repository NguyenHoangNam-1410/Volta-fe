import type { ReactNode } from "react";
import { COLORS } from "../constants/color.constant";

interface ScreenLayoutProps {
  /** Screen title */
  title: string;
  /** Actions and filters to display in the header (search, filters, buttons) */
  headerActions: ReactNode;
  /** Main content (usually a table/list) */
  children: ReactNode;
}

/**
 * Reusable screen layout with sticky header and scrollable content area.
 * The header (title + actions) stays fixed at the top while only the content scrolls.
 */
export const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  title,
  headerActions,
  children,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "90vh",
        background: COLORS.light,
      }}
    >
      {/* Sticky Header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: COLORS.light,
          padding: "16px 24px 0 24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <h2
            style={{
              margin: 0,
              color: COLORS.dark,
              fontSize: "30px",
              fontWeight: 600,
            }}
          >
            {title}
          </h2>
          {headerActions}
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          paddingInline: "24px",
          paddingTop: "24px",
        }}
      >
        {children}
      </div>
    </div>
  );
};
