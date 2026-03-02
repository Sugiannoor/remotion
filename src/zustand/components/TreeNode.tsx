import React from "react";
import { COLORS, FONTS } from "../styles";

interface TreeNodeProps {
  label: string;
  x: number;
  y: number;
  r?: number;
  flashColor?: string; // if set, renders with this color
  idle?: boolean;
  selector?: string;
}

export const TreeNode: React.FC<TreeNodeProps> = ({
  label,
  x,
  y,
  r = 36,
  flashColor,
  idle = false,
  selector,
}) => {
  const bg = flashColor
    ? flashColor
    : idle
    ? COLORS.nodeIdle
    : COLORS.surface2;

  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={r}
        fill={bg}
        stroke={flashColor ? flashColor : COLORS.border}
        strokeWidth={flashColor ? 2 : 1}
        style={{ filter: flashColor ? `drop-shadow(0 0 8px ${flashColor})` : "none" }}
      />
      <text
        x={x}
        y={y + 5}
        textAnchor="middle"
        fill={COLORS.text}
        fontSize={16}
        fontFamily={FONTS.mono}
      >
        {label}
      </text>
      {selector && (
        <text
          x={x}
          y={y + r + 18}
          textAnchor="middle"
          fill={COLORS.textMuted}
          fontSize={13}
          fontFamily={FONTS.mono}
        >
          {selector}
        </text>
      )}
    </g>
  );
};
