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
      viewBox="0 0 100 100" // Adjusted viewBox for a square aspect ratio
      width={width}
      height={height}
      className={className}
      {...restProps}
    >
      <title>GoLibre Logo</title>
      {/* Optional: Add a simple background shape if desired */}
      {/* <rect width="100" height="100" rx="10" fill="hsl(var(--primary))" /> */}
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="50" // Adjust font size as needed
        fontWeight="bold"
        fill="hsl(var(--primary-foreground))" // Use primary foreground for text on primary background, or primary for text on light background
        className="fill-primary group-hover:fill-primary/80" // Tailwind class for primary color, adjustable
      >
        GL
      </text>
    </svg>
  );
}
