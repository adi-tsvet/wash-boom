'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FiTrash2, FiPlus, FiLogOut } from 'react-icons/fi';

// Types for User, Washroom, and Activity
type User = {
  _id: string;
  name: string;
  username: string;
  adminFlag: boolean;
};

type Washroom = {
  _id: string;
  name: string;
  status: 'occupied' | 'vacant';
  occupiedBy: string | null;
};

type Activity = {
  _id: string;
  occupied_by: string;
  washroom: string;
  type: string;
  start_time: string;
  end_time: string | null;
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [washrooms, setWashrooms] = useState<Washroom[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newUser, setNewUser] = useState({ name: '', username: '', password: '', role: 'user' });
  const [newWashroom, setNewWashroom] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedWashroomId, setSelectedWashroomId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('activities');

  // Redirect non-admin users to login
  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated' || !session?.user?.adminFlag) {
      router.push('/login');
    }
  }, [status, session, router]);

  // Fetch data on component mount if the user is an admin
  useEffect(() => {
    if (session?.user?.adminFlag) {
      fetchData();
      fetchUsers();
      fetchWashrooms();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      const [userRes, washroomRes, activityRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/washrooms'),
        fetch('/api/admin/activities'),
      ]);

      setUsers(await userRes.json());
      setWashrooms(await washroomRes.json());
      setActivities(await activityRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
      setWashrooms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      setUsers(await res.json());
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchWashrooms = async () => {
    try {
      const res = await fetch('/api/admin/washrooms');
      setWashrooms(await res.json());
    } catch (error) {
      console.error('Error fetching washrooms:', error);
    }
  };

  // Create User
  const handleCreateUser = async () => {
    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      if (res.ok) {
        alert('User created successfully!');
        setNewUser({ name: '', username: '', password: '', role: 'user' });
        fetchUsers();
      } else {
        alert('Error creating user.');
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  // Create Washroom
  const handleCreateWashroom = async () => {
    try {
      const res = await fetch('/api/admin/create-washroom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newWashroom }),
      });

      if (res.ok) {
        alert('Washroom created successfully!');
        setNewWashroom('');
        fetchWashrooms();
      } else {
        alert('Error creating washroom.');
      }
    } catch (error) {
      console.error('Error creating washroom:', error);
    }
  };

  // Assign Washroom
  const handleAssignWashroom = async () => {
    console.log(selectedUserId , selectedWashroomId)
    if (!selectedUserId || !selectedWashroomId) {
      alert('Please select both user and washroom.');
      return;
    }

    try {
      const res = await fetch('/api/admin/assign-washroom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUserId, washroomId: selectedWashroomId }),
      });

      if (res.ok) {
        alert('Washroom assigned successfully!');
        fetchData();
      } else {
        alert('Failed to assign washroom.');
      }
    } catch (error) {
      console.error('Error assigning washroom:', error);
    }
  };

  // Vacate Washroom (admin override)
  const handleVacateWashroom = async (washroomId: string) => {
    try {
      const res = await fetch('/api/admin/force-vacate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ washroomId }),
      });

      if (res.ok) {
        alert('Washroom vacated successfully!');
        fetchWashrooms();
      } else {
        alert('Failed to vacate washroom.');
      }
    } catch (error) {
      console.error('Error vacating washroom:', error);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await fetch('/api/admin/users', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: id }),
        });
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleDeleteWashroom = async (id: string) => {
    if (confirm('Are you sure you want to delete this washroom?')) {
      try {
        await fetch('/api/admin/washrooms', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ washroomId: id }),
        });
        fetchWashrooms();
      } catch (error) {
        console.error('Error deleting washroom:', error);
      }
    }
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() => signOut()}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center"
        >
          <FiLogOut className="mr-2" /> Log Out
        </button>
      </div>

      {/* Tab Controls */}
      <div className="mb-6">
        {['activities', 'users', 'washrooms', 'assign'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 border ${activeTab === tab ? 'bg-blue-500 text-white' : 'bg-white'}`}
          >
            {tab[0].toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Activity Log */}
      {activeTab === 'activities' && (
        <div className="bg-white p-6 shadow rounded">
          <h2 className="text-2xl font-semibold mb-4">Activity Log</h2>
          <table className="w-full table-auto border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border p-2">User</th>
                <th className="border p-2">Washroom</th>
                <th className="border p-2">Type</th>
                <th className="border p-2">Start Time</th>
                <th className="border p-2">End Time</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity._id }>
                  <td className="border p-2">{activity.occupied_by}</td>
                  <td className="border p-2">{activity.washroom}</td>
                  <td className="border p-2">{activity.type}</td>
                  <td className="border p-2">{activity.start_time}</td>
                  <td className="border p-2">{activity.end_time || 'Ongoing'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white p-6 shadow rounded">
          <h2 className="text-2xl font-semibold mb-4">Create New User</h2>
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="border p-2 flex-1"
            />
            <input
              type="text"
              placeholder="Username"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              className="border p-2 flex-1"
            />
            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="border p-2 flex-1"
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="border p-2"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button onClick={handleCreateUser} className="bg-green-500 text-white px-4 py-2 rounded flex items-center">
              <FiPlus className="mr-2" /> Add User
            </button>
          </div>
          <h2 className="text-2xl font-semibold mb-4">All Users</h2>

          <table className="w-full table-auto border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border p-2">Username</th>
                <th className="border p-2">Role</th>
                <th className="border p-2">Name</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id }>
                  <td className="border p-2">{user.username}</td>
                  <td className="border p-2">{user.adminFlag ? 'Admin' : 'User'}</td>
                  <td className="border p-2">{user.name}</td>
                  <td className="border p-2"><button onClick={() => handleDeleteUser(user._id)} className="text-red-500">
                  <FiTrash2 /> Delete
                </button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Washrooms Tab */}
      {activeTab === 'washrooms' && (
        <div className="bg-white p-6 shadow rounded">
          <h2 className="text-2xl font-semibold mb-4">Create New Washroom</h2>
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Washroom Name"
              value={newWashroom}
              onChange={(e) => setNewWashroom(e.target.value)}
              className="border p-2 flex-1"
            />
            <button onClick={handleCreateWashroom} className="bg-blue-500 text-white px-4 py-2 rounded flex items-center">
              <FiPlus className="mr-2" /> Add Washroom
            </button>
          </div>
          <h2 className="text-2xl font-semibold mb-4">All Washrooms</h2>
          <ul>
            {washrooms.map((washroom) => (
              <li key={washroom._id} className="flex justify-between mb-2">
                <span>{washroom.name} - {washroom.status}</span>
                {washroom.status === 'occupied' && (
                  <button
                    onClick={() => handleVacateWashroom(washroom._id)}
                    className="text-red-500 ml-4"
                  >
                    Force Vacate
                  </button>
                )}
                <button onClick={() => handleDeleteWashroom(washroom._id)} className="text-red-500">
                  <FiTrash2 /> Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Assign Washroom Tab */}
      {activeTab === 'assign' && (
        <div className="bg-white p-6 shadow rounded">
          <h2 className="text-2xl font-semibold mb-4">Assign Washroom to User</h2>
          <div className="flex gap-4 mb-4">
            <select onChange={(e) => setSelectedUserId(e.target.value)} className="border p-2 flex-1">
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.username} ({user.adminFlag ? 'Admin' : 'User'})
                </option>
              ))}
            </select>
            <select onChange={(e) => setSelectedWashroomId(e.target.value)} className="border p-2 flex-1">
              <option value="">Select Washroom</option>
              {washrooms.map((washroom) => (
                <option key={washroom._id} value={washroom._id}>
                  {washroom.name} - {washroom.status}
                </option>
              ))}
            </select>
            <button onClick={handleAssignWashroom} className="bg-blue-500 text-white px-4 py-2 rounded">
              <FiPlus /> Assign
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
