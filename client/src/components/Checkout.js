import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
// prettier-ignore
import { Box, Button, Container, Heading, Text, TextField, Modal, Spinner } from 'gestalt';
// prettier-ignore
import { Elements, StripeProvider, CardElement, injectStripe } from 'react-stripe-elements';
import ToastMessage from './ToastMessage';
import { calculatePrice, calculateAmount, setToken, getCart, clearCart } from '../utils';

// Strapi SDK
import Strapi from 'strapi-sdk-javascript/build/main';
const apiUrl = process.env.API_URL || 'http://localhost:1337';
const strapi = new Strapi(apiUrl);

const _CheckoutForm = (props) => {

  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [confirmationEmailAddress, setConfirmationEmailAddress] = useState('');
  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [modal, setModal] = useState(false);


  useEffect(() => {
    setCartItems(getCart());
  }, []);

  const handleChange = ({ event, value }) => {
    event.persist();
    switch (event.target.name) {
      case 'address':
        setAddress(value);
        break;
      case 'postalCode':
        setPostalCode(value);
        break;
      case 'city':
        setCity(value);
        break;
      case 'confirmationEmailAddress':
        setConfirmationEmailAddress(value);
        break;
      default:
        break;
    }
  }

  const handleConfirmOrder = async (event) => {
    event.preventDefault();
    if (isFormEmpty()) {
      showToast("Fill all the fields");
      return;
    }
    setModal(true);
  }

  const handleSubmitOrder = async () => {

    // Have the correct format for Stripe
    const amount = calculateAmount(cartItems);

    // Process order
    setOrderProcessing(true);
    let token;
    try {
      // create Stripe token
      const response = await props.stripe.createToken();
      token = response.token.id;

      // create order with strapi sdk (make request to backend)
      await strapi.createEntry('orders', {
        amount,
        brews: cartItems,
        city,
        postalCode,
        address,
        token
      });

      // Send email
      await strapi.request('POST', '/email', {
        data: {
          to: confirmationEmailAddress,
          subject: `Order Confirmation - BrewHaha ${new Date(Date.now())}`,
          text: 'Your order has been processed',
          html: '<bold>Expect your order to arrive in 2-3 shipping days</bold>'
        }
      });

      setOrderProcessing(false);
      setModal(false);
      clearCart();

      showToast('Your order has been successfully submitted!', true);
    } catch (e) {
      console.log(e);
      setOrderProcessing(false);
      setModal(false);
      showToast(e.message);
    }
  }

  const isFormEmpty = () => {
    return !address || !postalCode || !city || !confirmationEmailAddress;
  }

  const showToast = (toastMessage, redirect = false) => {
    setToast(true);
    setToastMessage(toastMessage);
    setTimeout(() => {
      setToast(false);
      setToastMessage('');
      if (redirect) {
        props.history.push('/');
      }
    }, 5000);
  }

  const closeModal = () => setModal(false);

  return (
    <Container>
      <Box
        color="darkWash"
        margin={4}
        padding={4}
        shape="rounded"
        display="flex"
        justifyContent="center"
        alignItems="center"
        direction="column"
      >
        {/* Checkout Form Heading */}
        <Heading color="midnight">Checkout</Heading>
        {cartItems.length > 0 ? <React.Fragment>
          {/* User Cart */}
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            direction="column"
            marginTop={2}
            marginBottom={6}
          >
            <Text color="darkGray" italic>{cartItems.length} items for checkout</Text>
            <Box padding={2}>
              {cartItems.map((item) => (
                <Box key={item._id} padding={1}>
                  <Text color="midnight">
                    {item.name} x {item.quantity} - ${item.quantity * item.price}
                  </Text>
                </Box>
              ))}
            </Box>
            <Text bold>Total amount: {calculatePrice(cartItems)}</Text>
          </Box>

          {/* Checkout Form */}
          <form style={{
              display: 'inlineBlock',
              textAlign: 'center',
              maxWidth: 450
            }}
            onSubmit={handleConfirmOrder}
          >
            {/* Shipping Address Input */}
            <TextField
              id="address"
              type="text"
              name="address"
              placeholder="Shipping Address"
              onChange={handleChange}
            >
            </TextField>

            {/* Postal Code Input */}
            <TextField
              id="postalCode"
              type="text"
              name="postalCode"
              placeholder="Postal Code"
              onChange={handleChange}
            >
            </TextField>

            {/* City Input */}
            <TextField
              id="city"
              type="text"
              name="city"
              placeholder="City of Residence"
              onChange={handleChange}
            >
            </TextField>

            {/* Confirmation Email Address Input */}
            <TextField
              id="confirmationEmailAddress"
              type="email"
              name="confirmationEmailAddress"
              placeholder="Confirmation Email Address"
              onChange={handleChange}
            >
            </TextField>

            {/* Credit Card Element */}
            <CardElement id="stripe__input" onReady={input => input.focus()}/>
            <button id="stripe__button" type="submit">Submit</button>
          </form>
        </React.Fragment> : (
          // Default text if no items in the cart
          <Box color="darkWash" shape="rounded" padding={4}>
            <Heading align="center" color="watermelon" size="xs">Your cart is empty</Heading>
            <Text align="center" italic color="green">Add some brews</Text>
          </Box>
        )}
      </Box>
      {/* Confirmation Modal */}
      {modal && (
        <ConfirmationModal orderProcessing={orderProcessing} cartItems={cartItems} closeModal={closeModal} handleSubmitOrder={handleSubmitOrder}/>
      )}
      <ToastMessage show={toast} message={toastMessage}/>
    </Container>
  )
};

const ConfirmationModal = ({ orderProcessing, cartItems, closeModal, handleSubmitOrder }) => (
  <Modal
    accessibilityCloseLabel="close"
    accessibilityModalLabel="Confirm your order"
    heading="Confirm your header"
    onDismiss={closeModal}
    footer={
      <Box display="flex" marginRight={-1} marginLeft={-1} justifyContent="center">
        <Box padding={1}>
          <Button
            size="lg"
            color="red"
            text="Submit"
            disabled={orderProcessing}
            onClick={handleSubmitOrder}
          />
          <Button
            size="lg"
            text="Cancel"
            disabled={orderProcessing}
            onClick={closeModal}
          />
        </Box>
      </Box>
    }
    role="alertdialog"
    size="sm"
  >
    {/* Order Summary */}
    {!orderProcessing && (
      <Box display="flex" justifyContent="center" alignItems="center" direction="column" padding={2} color="lightWash">
        {cartItems.map(item => (
          <Box key={item._id} padding={1}>
            <Text size="lg" color="red">
              {item.name} x {item.quantity} - ${item.quantity * item.price}
            </Text>
          </Box>
        ))}
        <Box paddingY={2}>
          <Text size="lg" bold>
            Total: {calculatePrice(cartItems)}
          </Text>
        </Box>
      </Box>
    )}
    {/* Order Processing Spinner */}
    <Spinner show={orderProcessing} accessibilityLabel="Order Processing Spinner"/>
    {orderProcessing && <Text align="center" italic >Submitting order...</Text>}
  </Modal>
)

const CheckoutForm = withRouter(injectStripe(_CheckoutForm));

const Checkout = () => (
  <StripeProvider apiKey="pk_test_yer7O7lcHTNnOAHoeGQs0ycH00y9PYVOvt">
    <Elements>
      <CheckoutForm />
    </Elements>
  </StripeProvider>
)

export default Checkout;
