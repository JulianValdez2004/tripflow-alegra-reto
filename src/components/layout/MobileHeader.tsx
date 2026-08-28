import Image from "next/image";

export function MobileHeader() {
  return (
    <header className="md:hidden flex items-center justify-center h-16 bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center gap-2">
        <Image src="/icon.svg" alt="Tripflow Icon" width={32} height={32} className="object-contain" priority />
        <span className="font-bold text-2xl text-gray-900 tracking-tight">Tripflow</span>
      </div>
    </header>
  );
}
