import type { SVGProps } from 'react';

export default function LogoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      fill="currentColor" 
      {...props}
    >
      <path d="M50,5A45,45,0,1,0,95,50,45.05,45.05,0,0,0,50,5Zm0,82A37,37,0,1,1,87,50,37.042,37.042,0,0,1,50,87Z" />
      <path d="M58.5,66a12.433,12.433,0,0,1-8.839-3.661A12.5,12.5,0,1,1,58.5,34H50V26h8.5a20.5,20.5,0,0,0,0,41A20.378,20.378,0,0,0,70.062,60.062L62,52A12.43,12.43,0,0,1,58.5,66Z" />
      <path d="M36,50a6,6,0,1,0,6,6A6.006,6.006,0,0,0,36,50Zm0,8a2,2,0,1,1,2-2A2.002,2.002,0,0,1,36,58Z" />
    </svg>
  );
}
