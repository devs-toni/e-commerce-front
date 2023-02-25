import React from 'react';
import { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import Product from './Product';


const Category = () => {

  const productsDb = require('./database.json');
  const { type } = useParams();
  const [products, setProducts] = useState([]);
  const section = type;
  const navigate = useNavigate();

  useEffect(() => {
    setProducts([]);
    switch (section) {
      case 'road':
        setProducts(productsDb.products.road);
        break;
      case 'mtb':
        setProducts(productsDb.products.mtb);
        break;
      case 'ebike':
        setProducts(productsDb.products.ebike);
        break;
      case 'city':
        setProducts(productsDb.products.city);
        break;
      default:
        navigate('*');
        break;
    }
  }, [section, productsDb]);

  return (
    <div className='category'>
      <h3 className="category__title">{type.toLowerCase()}</h3>
      <div className="products">
        {products.length > 0 && products.map(({ id, name, price, stock, offer }) => {
          return <Product key={id} id={id} name={name} price={price} type={section} stock={stock} offer={offer} />
        })}
      </div>
    </div>
  );
};

export default Category;