import React, { useState } from 'react';
import "./Filter.css";

function Filter({ handleFilter }) {
  const [brandName, setBrandName] = useState('');
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');

  const handleBrandChange = (e) => {
    setBrandName(e.target.value);
  };

  const handlePriceChange = (e) => {
    setProductPrice(parseFloat(e.target.value));
  };

  const handleProductNameChange = (e) => {
    setProductName(e.target.value);
  };

  const handleBrandFilterClick = () => {
    handleFilter({
      price: productPrice,
      brand: brandName,
      product: productName
    });
  };

  return (
    <div className='filter__container'>
      <h3 className='filter__header'> Фильтры</h3>
      <input
        type="text"
        placeholder="Введите цену продукта"
        className='filter-input'
        value={productPrice || ''}
        onChange={handlePriceChange}
      />
      <input
        type="text"
        placeholder="Введите название продукта"
        className='filter-input'
        value={productName}
        onChange={handleProductNameChange}
      />
      <input
        type="text"
        placeholder="Введите название бренда"
        className='filter-input'
        value={brandName}
        onChange={handleBrandChange}
      />
      <button onClick={handleBrandFilterClick} className='filter-button'>Фильтровать</button>
    </div>
  );
}

export default Filter;
