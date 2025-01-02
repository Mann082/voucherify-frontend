import { useState } from 'react';
import api from '../utils/api';
import { setToken, decodeToken, removeToken } from '../utils/auth';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("Logging in with", email, password);

    try {
      const response = await api.post('/auth/login', { email, password });
      console.log("Login response:", response);

      if (response.data.accessToken) {
        const token = response.data.accessToken;
        setToken(token); // Save the token to localStorage
        const user = decodeToken(token); // Decode the token
        console.log('Decoded user:', user);

        if (user) {
          toast.success('Login successful!');
          setLoading(false);

          // Redirect based on role
          if (user.role === 'ADMIN') {
            router.push('/dashboard/admin');
          } else {
            router.push('/dashboard/customer');
          }
        } else {
          toast.error('Invalid token received.');
          setLoading(false);
        }
      } else {
        toast.error('Login failed. No access token received.');
        setLoading(false);
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error('Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md p-6 bg-white shadow-lg rounded-lg"
      >
        <h1 className="text-2xl font-bold text-center text-blue-600">Login</h1>
        <p className="mb-4 text-sm text-center text-gray-600">
          Welcome back! Please login to access your dashboard.
        </p>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 mb-4 border rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 mb-4 border rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          className={`w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <p className="mt-4 text-sm text-center text-gray-600">
          Don't have an account?{' '}
          <a
            href="/auth/register"
            className="font-semibold text-blue-600 hover:underline"
          >
            Register
          </a>
        </p>
      </form>
    </div>
  );
}
