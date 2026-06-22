export default function BrandLogo({ height = 40, className = "" }) {
  const fontSize = Math.round(height * 0.64);
  return (
    <span
      className={`inline-flex items-baseline leading-none ${className}`}
      aria-label="CVEnhance"
      style={{
        fontFamily: "'Plus Jakarta Sans', Inter, Arial, sans-serif",
        letterSpacing: "-0.035em",
        fontSize,
      }}
    >
<span
  style={{
    fontFamily: "'Manrope', 'Sora', 'Inter', sans-serif",
    fontSize: "26px",
    fontWeight: 800,
    letterSpacing: "-1px",
    display: "inline-flex",
    alignItems: "center",
  }}
>
  <span
    style={{
      background:
        "linear-gradient(135deg, #00D4FF 0%, #2563EB 40%, #14B8A6 75%, #10B981 100%)",
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      WebkitTextFillColor: "transparent",
      filter: "drop-shadow(0 2px 8px rgba(37,99,235,0.25))",
    }}
  >
    CV
  </span>

  <span
    style={{
      color: "#ffffff",
      fontWeight: 500,
    }}
  >
    Enhance
  </span>
</span>
    </span>
  );
}
