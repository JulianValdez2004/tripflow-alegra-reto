"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SplashPage() {
  const router = useRouter();
  const [textWidth, setTextWidth] = useState(0);

  useEffect(() => {
    // Iniciar revelado de texto después de 100ms
    const enterTimer = setTimeout(() => {
      setTextWidth(141.023); // Ancho total del texto
    }, 100);

    // Redirigir al dashboard después de 2.5s
    const redirectTimer = setTimeout(() => {
      router.push("/dashboard");
    }, 2500);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <div className="fixed inset-0 z-[999] bg-white flex flex-col items-center justify-center overflow-hidden h-[100dvh] w-full">
      <svg 
        className="w-full h-full object-cover max-w-[400px]" 
        viewBox="0 0 360 640" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <g clipPath="url(#clip0_6089_60)">
          <rect width="360" height="640" fill="white"/>
          
          <g clipPath="url(#clip1_6089_60)">
            <text x="110" y="333" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="36" fill="black" letterSpacing="-1">Tripflow</text>
          </g>
          
          <g clipPath="url(#clip2_6089_60)">
            <rect x="139.626" y="202.806" width="79.5304" height="79.5304" rx="39.7652" fill="#FF3482"/>
            <path d="M195.907 229.515C198.478 229.515 200.085 232.298 198.8 234.525L186.265 256.235C184.98 258.461 181.766 258.461 180.48 256.235L167.946 234.525C166.661 232.298 168.267 229.515 170.839 229.515L195.907 229.515Z" fill="white" fillOpacity="0.6"/>
            <path d="M181.577 238.529C183.486 238.529 184.679 240.596 183.725 242.249L174.417 258.37C173.462 260.024 171.076 260.024 170.121 258.37L160.814 242.249C159.859 240.596 161.052 238.529 162.962 238.529L181.577 238.529Z" fill="white"/>
          </g>
        </g>
        
        <defs>
          <clipPath id="clip0_6089_60">
            <rect width="360" height="640" fill="white"/>
          </clipPath>
          <clipPath id="clip1_6089_60">
            {/* Animación del texto revelándose hacia la derecha */}
            <rect 
              width={textWidth} 
              height="60.6727" 
              fill="white" 
              transform="translate(109 289.681)"
              style={{ transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
            />
          </clipPath>
          <clipPath id="clip2_6089_60">
            <rect width="79.5304" height="79.5304" fill="white" transform="translate(139.626 202.806)"/>
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}
