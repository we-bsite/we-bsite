import { Color } from "../types";
import { motion } from "framer-motion";

export enum FingerprintType {
  Active = "Active",
  Passive = "Passive",
}

interface Props {
  width: number;
  height: number;
  color: Color;
  top: number;
  left: number;
  opacity?: number;
  style?: React.CSSProperties;
  type?: FingerprintType;
}

export function Fingerprint({
  width,
  height,
  opacity,
  color,
  top,
  left,
  style,
  type = FingerprintType.Active,
}: Props) {
  // TODO: try to make this performance better. things to try
  // - https://www.crmarsh.com/svg-performance/
  // - use a div with a blur
  // - What about image for the blob/fingerprint and then a layer with background-blend-mode with a specific colour
  // try encoding the svg as an image source?

  const filterId =
    type === FingerprintType.Active
      ? `active-bbblurry-filter-${color}`
      : `bbblurry-filter-${color}`;

  return (
    <motion.div
      transition={{
        type: "spring",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: opacity || 1 }}
      exit={{ opacity: 0 }}
      {...{ style }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        {...{ "xmlns:svgjs": "http://svgjs.dev/svgjs" }}
        viewBox={`0 0 ${width * 4} ${height * 4}`}
        className={
          type === FingerprintType.Active ? "fingerprint active" : "fingerprint"
        }
        width={width * 2}
        height={height * 2}
        style={{
          top: `${top - height}px`,
          left: `${left - width}px`,
          ...(type === FingerprintType.Passive ? { borderRadius: "50%" } : {}),
        }}
      >
        {type === FingerprintType.Active && (
          <defs>
            <filter
              id={filterId}
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
              filterUnits="objectBoundingBox"
              primitiveUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
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
        )}
        <g filter={type === FingerprintType.Active ? `url(#${filterId})` : ""}>
          <ellipse
            rx={width}
            ry={height}
            cx={width * 2}
            cy={height * 2}
            fill={color}
          ></ellipse>
        </g>
      </svg>
    </motion.div>
  );
}
