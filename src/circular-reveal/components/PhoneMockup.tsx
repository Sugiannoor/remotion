import React, { CSSProperties } from "react";
import { COLORS } from "../styles";

interface PhoneMockupProps {
  width?: number;
  height?: number;
  children: React.ReactNode;
  style?: CSSProperties;
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  width = 340,
  height = 580,
  children,
  style,
}) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 32,
        border: `2px solid ${COLORS.border}`,
        background: COLORS.surface,
        overflow: "hidden",
        position: "relative",
        boxShadow: "0 12px 48px rgba(0,0,0,0.5)",
        ...style,
      }}
    >
      {/* Status bar */}
      <div
        style={{
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            width: 60,
            height: 6,
            borderRadius: 3,
            background: "rgba(255,255,255,0.2)",
          }}
        />
      </div>
      {/* Content area */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: height - 32,
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
};
