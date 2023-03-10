import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const Section = ({ name, icon, path }) => {
  return (
    <Link className={`${path ? "" : "disable"} sections__link`} to={path ? `product-category/bycicles/${path}` : ''}>
      <div className={`${path ? "" : "disable"} sections__section`}>
        <FontAwesomeIcon className='sections__section--image' icon={icon} />
        <p className='sections__section--name'>{name.toLowerCase()}</p>
      </div>
    </Link>
  )
}

Section.propTypes = {
  name: PropTypes.string.isRequired,
  icon: PropTypes.object.isRequired,
  path: PropTypes.string
}

export default Section;