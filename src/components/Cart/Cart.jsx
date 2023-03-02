import { faXmark, faCartShopping } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useContext, useState } from 'react'
import { useCart } from '../../context/CartContext';
import LanguageContext from '../../context/LanguageContext';
import { CartConfigHandler, ProductBox, CartFooter } from '../index';

import { calcTotalPrice } from '../../helpers/utils';
import uuid from 'react-uuid';

const Cart = () => {

  const { text } = useContext(LanguageContext);

  const { vars, modal, funcs } = useCart();
  const { totalProducts } = vars;
  const { isOpen, handleCart } = modal;
  const { removeProduct } = funcs;


  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div className={`cart ${isOpen ? 'active' : ''}`}>
      <div className={`cart-menu ${isOpen ? 'active' : ''}`} >
        <div className='cart-menu__header'>
          <FontAwesomeIcon icon={faXmark} onClick={handleCart} className='cart-menu__header--close' />
          <div className='cart-menu__header--content'>
            <FontAwesomeIcon className='cart-menu__header--content-icon' icon={faCartShopping} />
            <h1 className='cart-menu__header--content-title'>Cart</h1>
          </div>
        </div>
        <div className='cart-menu__content'>
          {console.log()}
          {
            totalProducts?.length > 0
              ?
              totalProducts.map(({ id, name, final, type, offer, price, total, config }) => {
                return (
                  <div className='cart-menu__content--product' key={uuid()}>
                    <FontAwesomeIcon 
                    icon={faXmark} 
                    className='cart-menu__content--product-close'
                    onClick={() => removeProduct(id)} />
                    <div className="cart-menu__content--product-calc">
                      <ProductBox
                        name={name}
                        finalPrice={final}
                        image={require(`../../assets/images/${type}/${name}-0.png`)}
                        loaded={imgLoaded}
                        setLoaded={setImgLoaded}
                        containerClass='cart-product-box'
                        offer={offer}
                        isCart={true}
                      />
                      <p className='total'>{calcTotalPrice(total, final)} €</p>
                    </div>
                    <CartConfigHandler
                      product={{ id, name, final, type, offer, price, total, config }}
                    />
                  </div>
                )
              })
              :
              <div className='cart-menu__empty'>
                <FontAwesomeIcon className="cart-menu__empty--svg" icon={faCartShopping} />
                <h1 className='cart-menu__empty--title'>{text.cart.empty}</h1>
              </div>
          }
        </div>
        <CartFooter />
      </div>
    </div>
  )
}

export default Cart