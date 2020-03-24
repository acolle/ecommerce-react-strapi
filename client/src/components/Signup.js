import React, { useState } from 'react';
import { Box, Button, Container, Heading, Text, TextField } from 'gestalt';
import ToastMessage from './ToastMessage';
import { setToken } from '../utils';

// Strapi SDK
import Strapi from 'strapi-sdk-javascript/build/main';
const apiUrl = process.env.API_URL || 'http://localhost:1337';
const strapi = new Strapi(apiUrl);

const Signup = (props) => {

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = ({ event, value }) => {
    event.persist();
    switch (event.target.name) {
      case 'username':
        setUsername(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      default:
        break;
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isFormEmpty()) {
      showToast("Fill all the fields");
      return;
    }
    // Sign up user
    try {
      setLoading(true);
      const response = await strapi.register(username, email, password);
      setLoading(false);
      setToken(response.jwt);
      redirectUser('/');
    } catch (e) {
      setLoading(false);
      showToast(e.message);
    }
  }

  const redirectUser = (path) => props.history.push(path);

  const isFormEmpty = () => {
    return !username || !email || !password;
  }

  const showToast = (toastMessage) => {
    setToast(true);
    setToastMessage(toastMessage);
    setTimeout(() => {
      setToast(false);
      setToastMessage('');
    }, 5000);
  }

  return (
    <Container>
      <Box
        dangerouslySetInlineStyle={{
          __style: {
            backgroundColor: '#ebe2da'
          }
        }}
        margin={4}
        padding={4}
        shape="rounded"
        display="flex"
        justifyContent="center"
      >
        {/* Sign Up Form */}
        <form style={{
            display: 'inlineBlock',
            textAlign: 'center',
            maxWidth: 450
          }}
          onSubmit={handleSubmit}
        >
          {/* Sign Up Form Heading */}
          <Box
            marginBottom={2}
            display="flex"
            direction="column"
            alignItems="center"
          >
            <Heading color="midnight">Let's get started</Heading>
            <Text italic color="orchid">Sign up to order some brews!</Text>
          </Box>
          {/* Username Input */}
          <TextField
            id="username"
            type="text"
            name="username"
            placeholder="Username"
            onChange={handleChange}
          >
          </TextField>

          {/* Email Input */}
          <TextField
            id="email"
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
          >
          </TextField>
          
          {/* Password Input */}
          <TextField
            id="password"
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
          >
          </TextField>
          <Button inline disabled={loading} color="blue" text="Submit" type="submit" />
        </form>
      </Box>
      <ToastMessage show={toast} message={toastMessage}/>
    </Container>
  )
};

export default Signup;
