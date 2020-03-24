import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { getToken } from './utils';
import 'gestalt/dist/gestalt.css';

import App from './components/App';
import Navbar from './components/Navbar';
import Signin from './components/Signin';
import Signup from './components/Signup';
import Checkout from './components/Checkout';
import Brews from './components/Brews';

import registerServiceWorker from './registerServiceWorker';

const PrivateRoute = ({ component: Component, ...rest }) => {
  return (
    <Route {...rest} render={props => (
        getToken() !== null ?
        <Component {...props}/> : <Redirect to={{
            pathname: '/signin'
          }}/>
      )}/>
  )
}

const Root = () => (
  <BrowserRouter>
    <React.Fragment>
      <Navbar />
      <Switch>
        <Route exact path="/" component={App} />
        <Route path="/signin" component={Signin} />
        <Route path="/signup" component={Signup} />
        <PrivateRoute path="/checkout" component={Checkout} />
        <Route path="/:brandId" component={Brews} />
      </Switch>
    </React.Fragment>
  </BrowserRouter>
)

ReactDOM.render(<Root />, document.getElementById('root'));
registerServiceWorker();
