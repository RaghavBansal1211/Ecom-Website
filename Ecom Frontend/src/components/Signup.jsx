import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';

const Signup = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await axios.post('http://localhost:8000/users/register', data);
      const token = response.data.token;
      localStorage.setItem('token', token);
      localStorage.setItem('role', "CUSTOMER");
      toast.success('Signup successful! Welcome Home...');
      navigate('/');
    } catch (err) {
      console.error(err);
      // Show backend error message or fallback text
      toast.error(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50">
      <Toaster position="top-center" />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-semibold text-center text-blue-600">Create Account</h2>

        <input
          type="text"
          placeholder="Name"
          className="w-full border rounded p-2"
          {...register('name', { required: 'Name is required' })}
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}

        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded p-2"
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^\S+@\S+$/, message: 'Invalid email' },
          })}
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded p-2"
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 6, message: 'Password must be at least 6 characters' },
          })}
        />
        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
        >
          {isSubmitting ? 'Creating...' : 'Sign Up'}
        </button>

        <p className="text-sm text-center text-gray-600 mt-4">
          Already have an account? <a href="/login" className="text-blue-600">Login</a>
        </p>
      </form>
    </div>
  );
};

export default Signup;
