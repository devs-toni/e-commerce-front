import { faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useNavigate, useSearchParams } from 'react-router-dom';
import PropTypes from 'prop-types';

const SearchForm = ({ close, handleSearch, innerRef }) => {

  const [searchParams, setSearchParams] = useSearchParams();
  
  const strQuery = searchParams.get('q') ?? '';
  const navigate = useNavigate();

  const handleChange = ({ target }) => {
    const { value } = target;
    setSearchParams({ q: value });
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    close();
    navigate(`/product-category/bycicles/search/${strQuery}`);
  }

  return (
    <div className="search__container">
      <div className="search__container--glass">
        <FontAwesomeIcon onClick={handleSubmit} icon={faMagnifyingGlass} />
      </div>
      <form onSubmit={handleSubmit}>
        <input type="text" value={strQuery} onChange={handleChange} ref={innerRef} />
      </form>
      <div className='search__container--close'>
        <FontAwesomeIcon icon={faXmark} onClick={close} />
      </div>
    </div>
  )
}

SearchForm.propTypes = {
  close: PropTypes.func.isRequired,
  innerRef: PropTypes.object.isRequired
}

export default SearchForm