import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

const UpdateProduct = () => {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:8000/products/fetchAll', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setProducts(res.data);
    } catch (err) {
      toast.error('Failed to load products');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEdit = (product) => {
    setEditingId(product._id);
    setValue('name', product.name);
    setValue('description', product.description);
    setValue('price', product.price);
    setValue('stock', product.stock);
    setExistingImages(product.imageUrl || []);
    setDeletedImages([]);
  };

  const onSubmit = async (data) => {
    const totalImages = existingImages.length + (data.image?.length || 0);
    if (totalImages > 5) {
      toast.error('You can only upload a maximum of 5 images.');
      return;
    }

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', data.price);
    formData.append('stock', data.stock);
    formData.append('deletedImages', JSON.stringify(deletedImages));

    if (data.image?.length) {
      for (const file of data.image) {
        formData.append('images', file);
      }
    }

    try {
      await axios.put(
        `http://localhost:8000/admin/updateProduct/${editingId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      toast.success('Product updated successfully ✅');
      setEditingId(null);
      reset();
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update product ❌');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Update Products</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) =>
          editingId === product._id ? (
            <div key={product._id} className="border p-4 rounded shadow-lg bg-white">
              <h3 className="text-xl font-semibold">{product.name}</h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <div>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    className="border p-2 w-full rounded"
                    placeholder="Product Name"
                  />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                </div>

                <div>
                  <input
                    {...register('description', { required: 'Description is required' })}
                    className="border p-2 w-full rounded"
                    placeholder="Description"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <input
                    type="number"
                    {...register('price', { required: 'Price is required' })}
                    className="border p-2 w-full rounded"
                    placeholder="Price"
                  />
                  {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
                </div>

                <div>
                  <input
                    type="number"
                    {...register('stock', { required: 'Stock is required' })}
                    className="border p-2 w-full rounded"
                    placeholder="Stock"
                  />
                  {errors.stock && <p className="text-red-500 text-sm">{errors.stock.message}</p>}
                </div>

                {/* Show existing images with delete option */}
                <div className="flex flex-wrap gap-2">
                  {existingImages.map((img, index) => (
                    <div key={index} className="relative w-24 h-24">
                      <img
                        src={`http://localhost:8000${img}`}
                        alt="product"
                        className="w-full h-full object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setDeletedImages((prev) => [...prev, img]);
                          setExistingImages((prev) => prev.filter((url) => url !== img));
                        }}
                        className="absolute top-0 right-0 bg-red-600 text-white rounded-full px-1 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* Upload new images */}
                <div>
                  <input
                    type="file"
                    multiple
                    {...register('image')}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-600 file:text-white
                      hover:file:bg-blue-700 transition"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-4"
                >
                  Save Changes
                </button>
              </form>
            </div>
          ) : (
            <div key={product._id} className="border p-4 rounded shadow-lg bg-white">
              {product.imageUrl?.[0] && (
                <img
                  src={`http://localhost:8000${product.imageUrl[0]}`}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded mb-4"
                />
              )}
              <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-2">{product.description}</p>
              <p className="font-semibold text-lg mb-2">₹{product.price}</p>
              <p className="text-gray-600 mb-4">Stock: {product.stock}</p>
              <button
                onClick={() => handleEdit(product)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default UpdateProduct;
