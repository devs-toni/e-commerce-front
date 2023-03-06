import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { useCart } from '../../context/CartContext';

const Icon = ({ isCartBtn, parentStyles, btnStyles, icon, handler }) => {

  const { vars } = useCart();
  const { totalProducts } = vars;

  const hasItems = (totalProducts.length > 0) ? true : false;
  const hasItemsStyles = hasItems ? 'active' : '';

  return (
    <button className={`${parentStyles}-${btnStyles} nav-icon`} onClick={handler}>
      <FontAwesomeIcon icon={icon} />
      {
        isCartBtn
        &&
        <span className={hasItemsStyles}>{hasItems && totalProducts.length}</span>
      }
    </button>
  )
}

Icon.propTypes = {
  isCartBtn: PropTypes.bool,
  parentStyles: PropTypes.string.isRequired,
  btnStyles: PropTypes.string.isRequired,
  icon: PropTypes.object.isRequired,
  handler: PropTypes.func.isRequired,
}

export default Icon