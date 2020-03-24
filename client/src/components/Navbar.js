import React from 'react';
import { Box, Button, Heading, Text, Image } from 'gestalt';
import { getToken, clearToken, clearCart } from '../utils';
import { NavLink, withRouter } from 'react-router-dom'

const Navbar = (props) => {

  const handleSignout = () => {
    clearToken();
    clearCart();
    props.history.push('/');
  }

  return getToken() !== null ? <AuthNavbar handleSignout={handleSignout} /> : <UnAuthNavbar />;
}

const AuthNavbar = ({ handleSignout }) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="around"
      height={70}
      color="midnight"
      padding={1}
      shape="roundedBottom"
    >

    {/* Checkout Link */}
    <NavLink activeClassName="active" to="/checkout">
      <Text size="xl" color="white">
        Checkout
      </Text>
    </NavLink>

    {/* Title & Logo */}
    <NavLink exact to="/">
      <Box display="flex" alignItems="center">
        <Box margin={2} height={50} width={50}>
          <Image
            alt="BrewHaha logo"
            naturalHeight={1}
            naturalWidth={1}
            src="./icons/logo.svg"
          />
        </Box>
        <div className="main-title">
          <Heading size="xs" color="orange">
            BrewHaha
          </Heading>
        </div>
      </Box>
    </NavLink>

    {/* Signout Button */}
    <Button
      color="transparent"
      text="Sign out"
      inline
      size="md"
      onClick={handleSignout}
    />

    </Box>
  )
}

const UnAuthNavbar = () => {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="around"
      height={70}
      color="midnight"
      padding={1}
      shape="roundedBottom"
    >

    {/* Sign In Link */}
    <NavLink activeClassName="active" to="/signin">
      <Text size="xl" color="white">
        Sign in
      </Text>
    </NavLink>

    {/* Title & Logo */}
    <NavLink exact to="/">
      <Box display="flex" alignItems="center">
        <Box margin={2} height={50} width={50}>
          <Image
            alt="BrewHaha logo"
            naturalHeight={1}
            naturalWidth={1}
            src="./icons/logo.svg"
          />
        </Box>
        <div className="main-title">
          <Heading size="xs" color="orange">
            BrewHaha
          </Heading>
        </div>
      </Box>
    </NavLink>

    {/* Sign Up Link */}
    <NavLink activeClassName="active" to="/signup">
      <Text size="xl" color="white">
        Sign up
      </Text>
    </NavLink>

    </Box>
  )
}

export default withRouter(Navbar);
