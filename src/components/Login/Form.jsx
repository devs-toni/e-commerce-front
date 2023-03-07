import React, { useState } from 'react'
import { useLanguage } from '../../context/GlobalContext';
import { useUser } from '../../context/UserContext';
import { http } from '../../helpers/http';
import { usersUrl } from '../../config';

const Form = () => {

  const { text } = useLanguage();

  const [formUser, setFormUser] = useState({
    email: '',
    password: ''
  });

  const { handleUser } = useUser();
  const { state: user_state, dispatch: user_dispatch, USER_ACTIONS } = handleUser();

  const handleInput = ({ target }) => {
    const { name, value } = target;
    setFormUser({ ...formUser, [name]: value })
    user_dispatch({ type: USER_ACTIONS.RESET_ERRORS });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    await http().post(`${usersUrl}/verify`, { body: formUser })
      .then(data => {

        if (data === -1) {

          user_dispatch({ type: USER_ACTIONS.LOGIN_ERROR, payload: text.login.error });
        } else {
          user_dispatch({ type: USER_ACTIONS.LOGIN_SUCCESS, payload: { username: formUser.email, id: data } })
        }
      });
  }
  return (
    <>
      <form onSubmit={handleSubmit} className="login__form">
        <input
          type="text"
          className='login__form--username'
          name="email"
          placeholder={text.login.email}
          onChange={handleInput}
          value={formUser.email}
        />
        <input
          type="password"
          className='login__form--password'
          name="password"
          placeholder={text.login.password}
          onChange={handleInput}
          value={formUser.password}
        />
        <input
          type="submit"
          className='login__form--send'
          value={text.login.signin} />
      </form>
      <p className='login__form--error'>{user_state?.error}</p>
    </>
  )
}

export default Form;