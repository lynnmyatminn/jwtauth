import './App.css';
import React, { useState } from 'react';
import axios from "axios";

function App() {

  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      //LOGIN API REQUEST
      const res = await axios.post('/login', { username, password });
      setUser(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (id) => {
    setSuccess(false);
    setError(false);
    try {
      setSuccess(true);
    } catch (error) {
      console.log(error);
      setError(true);
    }
  };


  return (
    <div className="container">
      {
        user ? (
          <div className='home'>

          </div>
        ) : (
          <div className='login'>
            <form onSubmit={handleSubmit}>
              <span className='formTitle'>JWT AUTH test</span>
              <input
                type='text'
                placeholder='username'
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                type='text'
                placeholder='password'
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type='submit' className='formSubmitButton'>
                login
              </button>
            </form>
          </div>
        )
      }
    </div>
  );
}

export default App;
