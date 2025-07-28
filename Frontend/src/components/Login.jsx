import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bgImage from '../assets/bg2.jpg'

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:4000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Only if your server uses cookies (e.g. with JWT)
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      setIsLoading(false);

      if (!response.ok) {
        setError(result.message || 'Invalid username or password');
      } else {
        setSuccess(result.message || 'Logged in successfully!');
        // ⏱️ Delay navigation to let success message appear briefly
        setTimeout(() => {
          navigate('/todoApp'); // or wherever your app redirects
        }, 1000);
      }

    } catch (error) {
      console.error('Login request failed:', error);
      setIsLoading(false);
      setError('Network error. Please try again later.');
    }
  };

  return (
    <div className="flex flex-col w-screen min-h-screen bg-gradient-to-br from-green-500 via-lime-500 to-green-700 items-center justify-center p-3 bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})` }}>
      <form
        onSubmit={handleSubmit}
        className="bg-black/5 w-full max-w-md rounded-2xl shadow-xl p-8 space-y-6 shadow-blue-500/40 hover:shadow-blue-500/80 hover:shadow-2xl transition duration-300 gap-4 backdrop-blur-sm"
      >
        <h2 className="text-3xl font-bold text-center text-purple-200">Login</h2>

        {error && (
          <div className="text-red-600 text-sm text-center font-medium bg-red-100 px-3 py-2 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="text-green-600 text-sm text-center font-medium bg-green-100 px-3 py-2 rounded-md">
            {success}
          </div>
        )}

        {/* Username */}
        <div>
          <label className="block text-sm font-medium dark:text-gray-300 mb-1">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 py-2  dark:border-purple-400 border-b-2 rounded-sm focus:outline-none focus:ring-2 focus:ring-purple-400 dark:text-gray-200"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium dark:text-gray-300 mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2  dark:border-purple-400 border-b-2 rounded-sm focus:outline-none focus:ring-2 focus:ring-purple-400 dark:text-gray-200"
            required
          />
        </div>

        <div>
          <a href="/passwordreset" className="dark:text-gray-400 text-sm hover:text-blue-500 hover:underline">Forgot password?</a>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full ${
            isLoading ? 'bg-purple-400' : 'bg-purple-500/80 hover:bg-purple-700'
          } text-white font-semibold py-2 rounded-lg transition-colors`}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
        <p className='text-center dark:text-gray-300'>Don't have an account? <a href="/signup" className='hover:text-blue-600 underline'>Click here</a></p>
      </form>
      
    </div>
  );
};

export default Login;
