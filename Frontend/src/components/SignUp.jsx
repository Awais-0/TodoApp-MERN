import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import bgImage from '../assets/bg2.jpg';

const SignUp = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    fullname: '',
    email: '',
    password: '',
    avatar: null
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    const payload = new FormData();
    payload.append('username', formData.username);
    payload.append('fullname', formData.fullname);
    payload.append('email', formData.email);
    payload.append('password', formData.password);
    if (formData.avatar) {
      payload.append('avatar', formData.avatar);
    }

    try {
      const response = await fetch('http://localhost:4000/api/users/register', {
        method: 'POST',
        body: payload,
      });

      let result;
  try {
    result = await response.json();
  } catch (jsonError) {
    const text = await response.text();
    console.error('Failed to parse JSON. Raw response:', text);
    throw new Error('Invalid JSON returned from server');
  }
      setIsLoading(false);

      if (!response.ok) {
        setError(result.message || 'Something went wrong.');
      } else {
        setSuccess(result.message || 'User registered successfully!');
        const loginPayload = {
          username: formData.username,
          password: formData.password
        };
        try {
          const response = await fetch('http://localhost:4000/api/users/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include', // Only if your server uses cookies (e.g. with JWT)
            body: JSON.stringify(loginPayload)
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
            setTimeout(() => {
              navigate('/todoApp');
            }, 1000);
          }

    } catch (error) {
      setIsLoading(false);
      setError('Request failed. Please try again later.');
    }
  };

  return (
    <div className="flex flex-col w-screen min-h-screen items-center justify-center p-3 bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})` }}>
      <form
        onSubmit={handleSubmit}
        className="bg-black/5 w-full max-w-sm rounded-xl shadow-lg p-6 space-y-4 shadow-blue-500/40 hover:shadow-blue-500/80 hover:shadow-2xl transition duration-300 gap-4 backdrop-blur-sm"
      >
        <h2 className="text-2xl font-bold text-center text-purple-200">Create your account</h2>
        <h6 className='text-center dark:text-gray-300'>Already registered? <a href="/login" className='underline hover:text-blue-700'>Login here</a></h6>

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

        <div>
          <label className="block text-sm font-medium dark:text-gray-300">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-3 py-1.5 mt-2 dark:border-purple-400 border-b-2 rounded-sm focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm dark:text-gray-200"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium dark:text-gray-300">Full Name</label>
          <input
            type="text"
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
            className="w-full px-3 py-1.5 mt-2 dark:border-purple-400 border-b-2 rounded-sm focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm dark:text-gray-200"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium dark:text-gray-300">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-1.5 mt-2 dark:border-purple-400 border-b-2 rounded-sm focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm dark:text-gray-200"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium dark:text-gray-300">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-1.5 mt-2 dark:border-purple-400 border-b-2 rounded-sm focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm dark:text-gray-200"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium dark:text-gray-300">Avatar</label>
          <input
            type="file"
            name="avatar"
            accept="image/*"
            onChange={handleChange}
            className="w-full text-sm dark:text-gray-300 file:mr-2 file:py-1 file:px-3
              file:rounded-md file:border-0 file:text-sm file:font-medium
              file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full ${
            isLoading ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'
          } text-white font-medium py-1.5 rounded-md transition-colors text-sm`}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
};

export default SignUp;
