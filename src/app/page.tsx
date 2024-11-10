'use client';
import { useRouter } from 'next/navigation'; // For navigation
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [isMounted, setIsMounted] = useState(false); // Flag to ensure client-side only rendering
  const router = useRouter(); // Router instance to navigate to login

  // Ensure component is only rendered after the client has mounted
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check for hydration errors and ensure consistent rendering
  if (!isMounted) return <div className="min-h-screen bg-gray-100"></div>; // Render a simple div to avoid mismatch

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 p-8">
      <div className="bg-white rounded-lg shadow-lg p-10 max-w-md w-full text-center">
        <h1 className="text-5xl font-extrabold mb-6 text-blue-600">Welcome to Wash-BooM</h1>
        <p className="text-gray-700 mb-6">
          Manage your washroom usage efficiently. Check availability and track user activities seamlessly.
        </p>

        <button
          onClick={() => router.push('/login')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
        >
          Login Here
        </button>
      </div>
    </div>
  );
}
