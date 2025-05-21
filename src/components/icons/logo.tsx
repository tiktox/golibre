import type { SVGProps } from 'react';
import Image from 'next/image';

export default function LogoIcon(props: SVGProps<SVGSVGElement>) {
  // Extract width and height from props if available, otherwise default
  const width = typeof props.width === 'number' ? props.width : typeof props.width === 'string' ? parseInt(props.width) : 32;
  const height = typeof props.height === 'number' ? props.height : typeof props.height === 'string' ? parseInt(props.height) : 32;

  return (
    <Image
      src="https://ik.imagekit.io/lics6cm47/httpstiktox.github.ioKGBKitchen%20(1).png?updatedAt=1747840090066"
      alt="GoLibre Logo"
      width={width}
      height={height}
      className={props.className}
      priority // Assuming logo is important for LCP
    />
  );
}
