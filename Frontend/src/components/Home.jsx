import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import bgImage from '../assets/bg2.jpg'

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:4000/api/users/check-auth', {
      credentials: 'include',
    })
      .then(res => {
        if (res.ok) {
          navigate('/todoApp');
        }
      })
      .catch(err => {
        console.error('Auth check failed:', err);
      });
  }, [navigate]);

  return (
    <div className="flex flex-col w-screen min-h-screen bg-gradient-to-br from-green-500 via-lime-500 to-green-700 p-6 items-center justify-center text-center bg-center bg-cover" style={{ backgroundImage: `url(${bgImage})` }}>
      <h1 className="font-extrabold text-5xl text-white drop-shadow-md mb-4">
        👋 Welcome to My ToDo App
      </h1>
      <p className="text-lg text-white/80 font-medium mb-8 max-w-lg">
        Organize your tasks and boost your productivity with this simple and elegant app.
      </p>
      <div className="flex gap-8 flex-wrap justify-center">
        <Link to="/signup" className="bg-white px-8 py-3 text-xl font-semibold text-violet-800 rounded-xl shadow-lg hover:bg-violet-100 hover:scale-105 transition-transform duration-300">
          SignUp
        </Link>
        <Link to="/login" className="bg-white px-8 py-3 text-xl font-semibold text-violet-800 rounded-xl shadow-lg hover:bg-violet-100 hover:scale-105 transition-transform duration-300">
          Login
        </Link>
      </div>
    </div>
  );
};

export default Home;
