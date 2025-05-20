import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';

const AddProduct = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

 const onSubmit = async (data) => {
  if (data.image.length > 5) {
    toast.error('You can only upload up to 5 images');
    return;
  }

  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('description', data.description);
  formData.append('price', data.price);
  formData.append('stock', data.stock);

  for (let i = 0; i < data.image.length; i++) {
    formData.append('images', data.image[i]);
  }

  try {
    await axios.post('http://localhost:8000/admin/createProduct', formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    toast.success('Product added successfully ✅');
    reset();
  } catch (error) {
    console.error(error);
    toast.error('Failed to add product');
  }
};


  return (
    <div className="flex items-center justify-center bg-gray-50 px-4 py-8 mt-10">
      <div className="p-6 border rounded-md bg-white shadow-md w-full max-w-xl">
        <h2 className="text-2xl font-bold mb-6 text-blue-700">Add Product</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              {...register('name', { required: 'Product name is required' })}
              placeholder="Product Name"
              className="border p-2 w-full rounded"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          <div>
            <textarea
              {...register('description', { required: 'Description is required' })}
              placeholder="Description"
              className="border p-2 w-full rounded"
            />
            {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
          </div>

          <div>
            <input
              type="number"
              {...register('price', { required: 'Price is required' })}
              placeholder="Price"
              className="border p-2 w-full rounded"
            />
            {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
          </div>

          <div>
            <input
              type="number"
              {...register('stock', { required: 'Stock is required' })}
              placeholder="Stock"
              className="border p-2 w-full rounded"
            />
            {errors.stock && <p className="text-red-500 text-sm">{errors.stock.message}</p>}
          </div>

          <div>
            <input
              type="file"
              multiple
              {...register('image', { required: 'Product image is required' })}
              className="w-full rounded file:mr-3 file:py-1 file:px-4 file:border-0 file:bg-blue-600 file:text-white file:rounded hover:file:bg-blue-700 transition"
            />
            {errors.image && <p className="text-red-500 text-sm">{errors.image.message}</p>}
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Add Product
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
