import Image from 'next/image';

export function Logo() {
  return (
    <div className="flex justify-center mb-4">
      <Image src="/logo.jpeg" alt="Startup Connect Logo" width={120} height={120} />
    </div>
  );
}