import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Card, Heading, IconButton, Image, Mask, Text } from 'gestalt';
import { calculatePrice, setCart, getCart } from '../utils';

// Strapi SDK
import Strapi from 'strapi-sdk-javascript/build/main';
const apiUrl = process.env.API_URL || 'http://localhost:1337';
const strapi = new Strapi(apiUrl);

const Brews = (props) => {

  const [brand, setBrand] = useState();
  const [brews, setBrews] = useState([]);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await strapi.request('POST', '/graphql', {
          data: {
            query: `query {
              brand(id: "${props.match.params.brandId}") {
                _id
                name
                brews {
                  _id
                  name
                  description
                  image {
                    url
                  }
                  price
                }
              }
            }`
          }
        });
        // console.log(response);
        await setBrand(response.data.brand.name);
        await setBrews(response.data.brand.brews);
        await setCartItems(getCart());
        // setLoadingBrands(false);
      } catch (e) {
        console.log(e);
        // setLoadingBrands(true);
      }
    }
    fetchData();
  }, []);

  // UseReducer instead of UseState?
  const addToCart = (brew) => {
    const alreadyInCart = cartItems.findIndex(item => item._id === brew._id);

    // findIndex returns -1 if the brew is not already in the cart
    if (alreadyInCart === -1) {
      const updatedItems = [...cartItems, {
        ...brew,
        quantity: 1
      }];
      setCartItems(updatedItems);
      setCart(updatedItems);
    } else {
      const updatedItems = [...cartItems];
      updatedItems[alreadyInCart].quantity += 1;
      setCartItems(updatedItems);
      setCart(updatedItems);
    }
  }

  const deleteItemFromCart = (id) => {
    const filteredItems = cartItems.filter(item => item._id !== id);
    setCartItems(filteredItems);
    setCart(filteredItems);
  }

  return (
    <Box
      margin={4}
      display="flex"
      justifyContent="center"
      alignItems="start"
      dangerouslySetInlineStyle={{
        __style: {
          flexWrap: 'wrap-reverse'
        }
      }}
    >
      {/* Brews Section */}
      <Box display="flex" direction="column" alignItems="center">
        {/* Brews Header */}
        <Box margin={2}>
          <Heading color="orchid">{brand}</Heading>
        </Box>
        {/* Brews */}
        <Box
          dangerouslySetInlineStyle={{
            __style: {
              backgroundColor: '#bdcdd9'
            }
          }}
          wrap
          shape="rounded"
          display="flex"
          justifyContent="center"
          padding={4}
        >
        {brews.map(brew => (
          <Box key={brew._id} margin={2} paddingY={4} width={210}>
            <Card
              image={
                <Box height={250} width={200}>
                  <Image
                    alt="Brew"
                    fit="cover"
                    naturalHeight={1}
                    naturalWidth={1}
                    src={`${apiUrl}${brew.image.url}`}
                  >
                  </Image>
                </Box>
              }
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                direction="column"
              >
                <Box marginBottom={2}>
                  <Text size="xl">{brew.name}</Text>
                </Box>
                <Text>{brew.description}</Text>
                <Text color="orchid">${brew.price}</Text>
                <Box marginTop={2}>
                  <Text size="xl">
                    <Button onClick={() => addToCart(brew)} color="blue" text="Add to Cart" />
                  </Text>
                </Box>
              </Box>
            </Card>
          </Box>
        ))}
        </Box>
      </Box>
      {/* User Cart */}
      <Box alignSelf="end" marginTop={2} marginLeft={8}>
        <Mask shape="rounded" wash>
          <Box display="flex" direction="column" alignItems="center" padding={2}>
            {/* User Cart Heading */}
            <Heading align="center" size="sm">Your Cart</Heading>
            <Text color="gray" italic>
              {cartItems.length} items selected
            </Text>

            {/* Cart Items */}
            {cartItems.map(item => (
              <Box key={item._id} display="flex" alignItems="center">
                <Text>
                  {item.name} x {item.quantity} - ${(item.quantity * item.price).toFixed(2)}
                </Text>
                <IconButton
                  accessibilityLabel="Delete Item"
                  icon="cancel"
                  size="sm"
                  iconColor="red"
                  onClick={() => deleteItemFromCart(item._id)}
                />
              </Box>
            ))}

            {/* User Cart Items */}
            <Box display="flex" alignItems="center" justifyContent="center" direction="column">
              <Box margin={2}>
                {cartItems.length === 0 && <Text>Please select some items</Text>}
              </Box>
              <Text size="lg">Total: {calculatePrice(cartItems)}</Text>
              <Text>
                <Link to="/checkout">Checkout</Link>
              </Text>
            </Box>
          </Box>
        </Mask>
      </Box>
    </Box>
  );
}

export default Brews;
