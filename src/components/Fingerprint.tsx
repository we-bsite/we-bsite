import { Color } from "../types";

interface Props {
  width: number;
  height: number;
  color: Color;
  top: number;
  left: number;
  hide?: boolean;
}

export function Fingerprint({ width, height, color, top, left, hide }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      {...{ "xmlns:svgjs": "http://svgjs.dev/svgjs" }}
      viewBox={`0 0 ${width * 4} ${height * 4}`}
      className="activeFingerprint"
      width={width * 2}
      height={height * 2}
      style={{
        top: `${top - height}px`,
        left: `${left - width}px`,
        display: hide ? "none" : "block",
      }}
    >
      <defs>
        <filter
          id="bbblurry-filter"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
          filterUnits="objectBoundingBox"
          primitiveUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feGaussianBlur
            stdDeviation="30"
            x="0%"
            y="0%"
            width="100%"
            height="100%"
            in="SourceGraphic"
            edgeMode="none"
            result="blur"
          ></feGaussianBlur>
        </filter>
      </defs>
      <g filter="url(#bbblurry-filter)">
        <ellipse
          rx={width}
          ry={height}
          cx={width * 2}
          cy={height * 2}
          fill={color}
        ></ellipse>
      </g>
    </svg>
  );
}
