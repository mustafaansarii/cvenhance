export default function BrandLogo({ height = 40, className = "" }) {
  const fontSize = Math.round(height * 0.66);
  return (
    <span
      className={`font-serif inline-flex items-baseline leading-none ${className}`}
      aria-label="CVEnhance"
      style={{ fontSize, letterSpacing: "-0.01em" }}
    >
      {/* "CV" in the brand accent; "Enhance" inherits the surrounding text color
          (currentColor) so it reads correctly on light, dark, and over images. */}
      <span className="text-accent" style={{ fontWeight: 700 }}>CV</span>
      <span style={{ color: "currentColor", fontWeight: 500 }}>Enhance</span>
    </span>
  );
}
