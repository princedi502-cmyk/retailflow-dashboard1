import React, { useState, useEffect } from 'react';

const ProductModal = ({ isOpen, onClose, onSave, product = null, mode = 'add' }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    barcode: '',
    low_stock_threshold: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price ?? '',
        stock: product.stock ?? '',           // FIX: was `quantity` — schema uses `stock`
        category: product.category || '',
        barcode: product.barcode || '',
        low_stock_threshold: product.low_stock_threshold ?? ''
      });
    } else {
      setFormData({ name: '', price: '', stock: '', category: '', barcode: '', low_stock_threshold: '' });
    }
    setErrors({});
  }, [product, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim())
      newErrors.name = 'Product name is required';

    if (formData.price === '' || isNaN(formData.price) || Number(formData.price) < 0)
      newErrors.price = 'Price must be 0 or greater';

    if (formData.stock === '' || isNaN(formData.stock) || Number(formData.stock) < 0)
      newErrors.stock = 'Stock must be 0 or greater';

    if (formData.stock !== '' && !Number.isInteger(Number(formData.stock)))
      newErrors.stock = 'Stock must be a whole number';

    if (
      formData.low_stock_threshold !== '' &&
      (!Number.isInteger(Number(formData.low_stock_threshold)) || Number(formData.low_stock_threshold) < 0)
    )
      newErrors.low_stock_threshold = 'Must be a whole number >= 0';

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const parsedStock = parseInt(formData.stock, 10);
    const parsedPrice = parseFloat(formData.price);

    // Hard guard — never let NaN reach the server
    if (isNaN(parsedStock) || isNaN(parsedPrice)) {
      setErrors(prev => ({
        ...prev,
        ...(isNaN(parsedStock) && { stock: 'Stock is required' }),
        ...(isNaN(parsedPrice) && { price: 'Price is required' }),
      }));
      return;
    }

    // Exact shape of ProductCreate Pydantic schema
    const payload = {
      name: formData.name.trim(),                   // str  (required)
      price: parsedPrice,                           // float (required)
      stock: parsedStock,                           // int  (required)
      category: formData.category.trim() || null,   // Optional[str]
      barcode: formData.barcode.trim() || null,     // Optional[str]
      low_stock_threshold: formData.low_stock_threshold !== ''
        ? parseInt(formData.low_stock_threshold, 10)
        : null                                      // Optional[int]
    };

    onSave(payload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity" onClick={onClose} />

        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            {mode === 'add' ? 'Add New Product' : 'Edit Product'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name */}
            <div>
              <label htmlFor="name" className="label block mb-2">Product Name *</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange}
                className={`input ${errors.name ? 'border-danger-500' : ''}`} placeholder="Enter product name" />
              {errors.name && <p className="text-danger-600 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="label block mb-2">Price (₹) *</label>
              <input type="number" id="price" name="price" value={formData.price} onChange={handleChange}
                className={`input ${errors.price ? 'border-danger-500' : ''}`} placeholder="0.00" step="0.01" min="0" />
              {errors.price && <p className="text-danger-600 text-sm mt-1">{errors.price}</p>}
            </div>

            {/* Stock */}
            <div>
              <label htmlFor="stock" className="label block mb-2">Stock *</label>
              <input type="number" id="stock" name="stock" value={formData.stock} onChange={handleChange}
                className={`input ${errors.stock ? 'border-danger-500' : ''}`} placeholder="0" min="0" step="1" />
              {errors.stock && <p className="text-danger-600 text-sm mt-1">{errors.stock}</p>}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="label block mb-2">Category</label>
              <input type="text" id="category" name="category" value={formData.category} onChange={handleChange}
                className="input" placeholder="e.g., Electronics, Clothing" />
            </div>

            {/* Barcode */}
            <div>
              <label htmlFor="barcode" className="label block mb-2">Barcode</label>
              <input type="text" id="barcode" name="barcode" value={formData.barcode} onChange={handleChange}
                className="input" placeholder="e.g., 8901234567890" />
            </div>

            {/* Low Stock Threshold */}
            <div>
              <label htmlFor="low_stock_threshold" className="label block mb-2">Low Stock Threshold</label>
              <input type="number" id="low_stock_threshold" name="low_stock_threshold"
                value={formData.low_stock_threshold} onChange={handleChange}
                className={`input ${errors.low_stock_threshold ? 'border-danger-500' : ''}`}
                placeholder="e.g., 10" min="0" step="1" />
              {errors.low_stock_threshold && <p className="text-danger-600 text-sm mt-1">{errors.low_stock_threshold}</p>}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary">
                {mode === 'add' ? 'Add Product' : 'Save Changes'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;