
import type { SVGProps } from 'react';

export default function LogoIcon(props: SVGProps<SVGSVGElement>) {
  const {
    width: propWidth,
    height: propHeight,
    className,
    ...restProps
  } = props;

  const width = typeof propWidth === 'number' ? propWidth : typeof propWidth === 'string' ? parseInt(propWidth) : 32;
  const height = typeof propHeight === 'number' ? propHeight : typeof propHeight === 'string' ? parseInt(propHeight) : 32;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={width}
      height={height}
      className={className}
      {...restProps}
    >
      <title>GoLibre Logo</title>
      {/* Black background */}
      <rect width="100" height="100" rx="20" fill="black" />

      {/* Decorative ring using primary color */}
      <circle cx="50" cy="50" r="32" fill="none" stroke="hsl(var(--primary))" strokeWidth="4" />

      {/* GL Text */}
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="40" 
        fontWeight="bold"
        fill="white"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        GL
      </text>
    </svg>
  );
}
