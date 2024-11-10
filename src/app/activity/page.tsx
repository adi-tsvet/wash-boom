'use client';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type Washroom = {
  id: number;
  name: string;
  status: 'occupied' | 'vacant';
  occupied_by: string | null;
};

export default function ActivityPage() {
  const { data: session, status } = useSession();
  const [washrooms, setWashrooms] = useState<Washroom[]>([]);
  const [activityType, setActivityType] = useState<string>('shower'); // Default activity type
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.id) {
      console.log('Fetching assigned washrooms for user:', session.user.id);
      fetchUserAssignedWashrooms(session.user.id);
    }
  }, [status, session, router]);
  useEffect(() => {
    const interval = setInterval(() => {
      if (session?.user?.id) {
        fetchUserAssignedWashrooms(session.user.id);
      }
    }, 5000); // Fetch data every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [session]);

 

  const fetchUserAssignedWashrooms = async (userId: number) => {
    try {
      const res = await fetch(`/api/user/activity?userId=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch assigned washrooms');
      const data: Washroom[] = await res.json();
      console.log('Fetched washrooms:', data);
      setWashrooms(data);
    } catch (error) {
      console.error('Error fetching washrooms:', error);
    }
  };

  


  const handleOccupy = async (washroomId: number) => {
    try {
      const userId = session?.user?.id;
      if (!userId) throw new Error('User ID not found in session');

      const res = await fetch('/api/user/occupy-washroom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ washroomId, userId, activityType }),
      });

      if (!res.ok) throw new Error('Failed to occupy washroom');
      await fetchUserAssignedWashrooms(userId);
    } catch (error) {
      console.error('Error occupying washroom:', error);
    }
  };

  const handleVacate = async (washroomId: number) => {
    try {
      const userId = session?.user?.id;
      if (!userId) throw new Error('User ID not found in session');

      const res = await fetch('/api/user/vacate-washroom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ washroomId, userId }),
      });

      if (!res.ok) throw new Error('Failed to vacate washroom');
      await fetchUserAssignedWashrooms(userId);
    } catch (error) {
      console.error('Error vacating washroom:', error);
    }
  };
  if (status === 'loading') return <p>Loading...</p>;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="w-full flex justify-between mb-4">
        <h1 className="text-3xl font-bold">Welcome, {session?.user?.name}</h1>
        <button onClick={()=>signOut()} className="bg-red-500 text-white px-4 py-2 rounded">
          Logout
        </button>
      </div>

      <ul className="w-full max-w-md">
        {washrooms.map((washroom) => (
          <li key={washroom.id} className="flex flex-col p-4 mb-4 bg-white shadow rounded">
            <span className="font-medium">
              {washroom.name} - {washroom.status}
              {washroom.status === 'occupied' &&
                ` (Occupied by: ${washroom.occupied_by === session?.user?.username ? 'You' : washroom.occupied_by || 'N/A'})`}
            </span>

            {washroom.status === 'vacant' ? (
              <div className="mt-2">
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="border rounded p-2 mr-2"
                >
                  <option value="shower">Shower</option>
                  <option value="poop">Poop</option>
                </select>
                <button
                  onClick={() => handleOccupy(washroom.id)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  Occupy
                </button>
              </div>
            ) : (
              washroom.occupied_by === session?.user?.username && (
                <button
                  onClick={() => handleVacate(washroom.id)}
                  className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                  Vacate
                </button>
              )
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
