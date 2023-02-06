import { Color } from "../types";

interface Props {
  width: number;
  height: number;
  color: Color;
  top: number;
  left: number;
}

export function Fingerprint({ width, height, color, top, left }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      {...{ "xmlns:svgjs": "http://svgjs.dev/svgjs" }}
      viewBox={`0 0 ${width * 4} ${height * 4}`}
      className="activeFingerprint"
      width={width}
      height={height}
      style={{
        top: `${top - height / 2}px`,
        left: `${left - width / 2}px`,
      }}
    >
      <defs>
        <filter
          id="bbblurry-filter"
          x="-100%"
          y="-100%"
          width="400%"
          height="400%"
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
          cx={width}
          cy={height}
          fill={color}
        ></ellipse>
      </g>
    </svg>
  );
}
