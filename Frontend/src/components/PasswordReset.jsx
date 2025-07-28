import React, { useState } from 'react'
import bgImage from '../assets/bg2.jpg'
import { useNavigate } from 'react-router-dom';

const PasswordReset = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
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
      const response = await fetch('http://localhost:4000/api/users/password-reset-link', {
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
        setError(result.message || 'Email not registered');
      } else {
        setSuccess(result.message || 'Email sent successfully!');
        // ⏱️ Delay navigation to let success message appear briefly
        // setTimeout(() => {
        //   navigate('/todoApp'); // or wherever your app redirects
        // }, 1000);
      }

    } catch (error) {
      console.error('Request failed:', error);
      setIsLoading(false);
      setError('Network error. Please try again later.');
    }
  };

  return (
    <div className="flex flex-col w-screen min-h-screen bg-gradient-to-br from-green-500 via-lime-500 to-green-700 items-center justify-center p-3 bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})` }}>
        <form
        onSubmit={handleSubmit}
        className="bg-black/50 w-full max-w-md rounded-2xl shadow-xl p-8 space-y-6"
      >
        <h2 className="text-3xl font-bold text-center text-purple-200">Password reset</h2>
        <p className='text-sm text-gray-200'>Enter a registered email to get a password resent link via email</p>

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

        {/* Email */}
        <div>
          <input
            type="email"
            name="email"
            placeholder='Enter you email'
            onChange={handleChange}
            className="w-full px-4 py-2  dark:border-purple-400 border-b-2 rounded-sm focus:outline-none focus:ring-2 focus:ring-purple-400 dark:text-gray-200"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full ${
            isLoading ? 'bg-purple-400' : 'bg-purple-500/80 hover:bg-purple-700'
          } text-white font-semibold py-2 rounded-lg transition-colors mt-5`}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  )
}

export default PasswordReset