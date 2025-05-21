import type { SVGProps } from 'react';

export default function LogoIcon(props: SVGProps<SVGSVGElement>) {
  const {
    width: propWidth,
    height: propHeight,
    className,
    ...restProps
  } = props;

  // Use provided width/height or default to 32 if not specified
  // This maintains consistency with how it might be used elsewhere (e.g., header vs homepage)
  const width = typeof propWidth === 'number' ? propWidth : typeof propWidth === 'string' ? parseInt(propWidth) : 32;
  const height = typeof propHeight === 'number' ? propHeight : typeof propHeight === 'string' ? parseInt(propHeight) : 32;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 130 110" // Adjusted viewBox for the overall shape including text
      width={width}
      height={height}
      className={className}
      {...restProps}
    >
      <title>GoLibre Logo</title>
      <defs>
        {/* Adjusted path for text to be higher and more curved */}
        <path id="goLibreTextPath" d="M30 38 C 45 18, 85 18, 100 38" fill="none" />
      </defs>

      {/* Headset parts - drawn first to be in the background */}
      {/* Left Earpiece */}
      <path d="M10 50 C5 50, 0 55, 0 60 L0 75 C0 80, 5 85, 10 85 L20 85 C25 85, 30 80, 30 75 L30 60 C30 55, 25 50, 20 50 Z" fill="#000000" />
      {/* Right Earpiece */}
      <path d="M100 50 C95 50, 90 55, 90 60 L90 75 C90 80, 95 85, 100 85 L110 85 C115 85, 120 80, 120 75 L120 60 C120 55, 115 50, 110 50 Z" fill="#000000" />
      {/* Headband - slightly thinner and adjusted curve */}
      <path d="M20 53 C 20 23, 110 23, 110 53" stroke="#000000" strokeWidth="14" fill="none" strokeLinecap="round" />
      {/* Mic Arm - adjusted curve and thickness */}
      <path d="M110 76 C 90 103, 75 93, 70 88" stroke="#000000" strokeWidth="12" fill="none" strokeLinecap="round" />

      {/* Location Pin - drawn on top of headset parts */}
      <path
        d="M65 98 C40 75, 38 55, 65 35 C92 55, 90 75, 65 98 Z"
        fill="#FF0000" // Red
        stroke="#000000" // Black stroke for definition
        strokeWidth="1"
      />
      {/* Inner circle in Pin */}
      <circle cx="65" cy="60" r="13" fill="white" />

      {/* Text "GO LIBRE" - drawn last to be on top */}
      <text
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="17" // Slightly larger font size
        fontWeight="bold"
        fill="#000000"
        letterSpacing="0.5"
      >
        <textPath href="#goLibreTextPath" startOffset="50%" textAnchor="middle" dominantBaseline="central">
          GO LIBRE
        </textPath>
      </text>
    </svg>
  );
}
