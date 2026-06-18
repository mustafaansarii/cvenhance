export default function BrandLogo({ height = 40, className = "" }) {
  const green = "#14b8a6";
  const white = "#ececec";
  return (
    <svg
      width={(height * 600) / 128}
      height={height}
      viewBox="0 0 600 128"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="cvenhance"
      className={`shrink-0 ${className}`}
      fill="none"
    >
      {/* Document + CV icon */}
      <path
        d="M36 12h36l24 24v68a12 12 0 0 1-12 12H36a12 12 0 0 1-12-12V24a12 12 0 0 1 12-12z"
        stroke={green}
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <path
        d="M72 12v24h24"
        stroke={green}
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <text
        x="60"
        y="76"
        textAnchor="middle"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="26"
        fontWeight="700"
        fill={green}
      >
        CV
      </text>

      <text
        x="132"
        y="90"
        fontFamily="'Plus Jakarta Sans', Inter, Arial, sans-serif"
        fontSize="74"
        fontWeight="800"
        letterSpacing="-3"
        fill={white}
      >
        CV<tspan fill={green}>Enhance</tspan>
      </text>
    </svg>
  );
}
