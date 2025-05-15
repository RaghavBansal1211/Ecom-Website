import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const res = await axios.post('http://localhost:8000/users/login', data);
      const { token, user } = res.data;

      // Store token and role
      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);

      // Redirect based on role
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50">
      <Toaster position="top-center" />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-semibold text-center text-blue-600">Login</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded p-2"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^\S+@\S+$/,
              message: 'Invalid email address',
            },
          })}
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded p-2"
          {...register('password', { required: 'Password is required' })}
        />
        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>

        <p className="text-sm text-center text-gray-600 mt-4">
          Don’t have an account? <a href="/signup" className="text-blue-600">Sign up</a>
        </p>
      </form>
    </div>
  );
};

export default Login;
