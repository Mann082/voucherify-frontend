import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { useRouter } from 'next/router';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const router = useRouter();

  const handleRedirect = () => {
    router.push('/auth/register');
  };

  return (
    <div className="bg-white text-gray-800 min-h-screen flex items-center justify-center p-8">
      <main className="flex flex-col gap-8 items-center shadow-lg rounded-lg p-10">
        <h1 className="text-3xl font-bold">Welcome to Voucherify</h1>
        <button
          onClick={handleRedirect}
          className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-blue-500 text-white gap-2 hover:bg-blue-600 text-lg h-12 px-6"
        >
          Go to Registration
        </button>
      </main>
    </div>
  );
}
