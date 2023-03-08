export function shuffleArray(array: any[]) {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

// From cursor-chat
export function getSvgForCursor(color: string) {
  return `<svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="13 9 35 35"
      width="36"
      height="36"
      fill="none"
      fillRule="evenodd"
    >
      <g fill="rgba(0,0,0,.2)" transform="translate(1,1)">
        <path d="m12 24.4219v-16.015l11.591 11.619h-6.781l-.411.124z" />
        <path d="m21.0845 25.0962-3.605 1.535-4.682-11.089 3.686-1.553z" />
      </g>
      <g fill="white">
        <path d="m12 24.4219v-16.015l11.591 11.619h-6.781l-.411.124z" />
        <path d="m21.0845 25.0962-3.605 1.535-4.682-11.089 3.686-1.553z" />
      </g>
      <g fill="${color}">
        <path d="m19.751 24.4155-1.844.774-3.1-7.374 1.841-.775z" />
        <path d="m13 10.814v11.188l2.969-2.866.428-.139h4.768z" />
      </g>
    </svg>`;
}

// from: https://github.com/yoksel/url-encoder/blob/master/src/js/script.js
const symbols = /[\r\n%#()<>?[\\\]^`{|}]/g;
export function encodeSVG(svgData: string) {
  // Use single quotes instead of double to avoid encoding.
  svgData = svgData.replace(/"/g, `'`);

  svgData = svgData.replace(/>\s{1,}</g, `><`);
  svgData = svgData.replace(/\s{2,}/g, ` `);

  // Using encodeURIComponent() as replacement function
  // allows to keep result code readable
  return svgData.replace(symbols, encodeURIComponent);
}
