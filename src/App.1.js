import React, { Component } from 'react';
import { client, venmo, dataCollector } from 'braintree-web';

import logo from './logo.svg';
import './App.css';

let venmoInstance = null; // Live past the React component lifecycle.
const variant = "blue",
    enabled = true,
    mobile = true,
    mode = "client_token",
    authorizationKey = "",
    isNonceNotExpired = "",
    venmoData = {
      "nonce":"",
      "venmoClientTokenData":"",
      "deviceData":"",
      "supportedByBrowser":true
    },
    prePromises = [null,null],
    allowNewBrowserTab = false;

class App extends Component {
  constructor(props) {
    super(props);
    this.venmoButtonRef = null;
  }

  componentDidMount() {
    this.setupVenmoInstance();
  }

  setupVenmoInstance = () => {
    if (this.canCallVenmoApi()) {
      // setVenmoData({ loading: true });
      client.create({ authorization: "sandbox_grxmhgjq_5qvjghrh9gbqxw7k" })
        .then((client) => {
          alert()
          return Promise.all([
            venmo.create({
              client,
              allowNewBrowserTab,
            }),
            dataCollector.create({
              client,
              paypal: true,
            }),
          ])
            .then(([venmoInstanceRef, dataCollectorInstanceRef]) => {
              venmoInstance = venmoInstanceRef;
              if (venmoInstance.isBrowserSupported()) {
                const { deviceData } = dataCollectorInstanceRef;
                if (deviceData) {
                  const deviceDataValue = JSON.parse(deviceData);
                  // setVenmoData({
                  //   deviceData: deviceDataValue.correlation_id,
                  //   supportedByBrowser: true,
                  // });
                }
              } else {
                console.error('Opening Venmo in the same tab is not supported by this browser');
                // setVenmoData({ supportedByBrowser: false });
              }
            })
            .catch(err => this.handleVenmoError(err))
            .finally(() => {
              // setVenmoData({ loading: false });
            });
        })
        .finally(() => {
          // setVenmoData({ loading: false });
        });
    }
  }

  canCallVenmoApi = () => {
    return enabled && authorizationKey && !mobile;
  }

  handleVenmoClick = (e) => {
    alert()
  }

  handleVenmoSuccess = (payload) => {
    const { setVenmoData, mode, onVenmoPaymentButtonClick } = this.props;
    const successData = { ...payload, error: null, timestamp: Date.now() };
    setVenmoData(successData);
    onVenmoPaymentButtonClick(mode);
  }

  handleVenmoError = ({ code, message, name }) => {
    const { setVenmoData, onVenmoPaymentButtonError } = this.props;
    const errorData = { nonce: '', error: { code, message, name } };
    setVenmoData(errorData);
    onVenmoPaymentButtonError(errorData);
  }


   render = () => {

    const { supportedByBrowser } = venmoData || {};
    return (enabled && mobile && supportedByBrowser
      // Do not show button if there's no authorization key when in client token mode
      // && (this.canCallVenmoApi()
        // Show button, but do not call Venmo api.
        // || mode === VenmoPaymentButton.modes.PAYMENT_TOKEN)
      ? (
      <button
        type="button"
        onClick={this.handleVenmoClick}
        ref={this.setVenmoButtonRef}
        className={`VenmoPaymentButton  ${variant}`}
        aria-label="Venmo Payment Button"
      >
        <img
          src={`/venmo_blue_logo.svg`}
          alt="Venmo Payment Button"
        />
      </button>
      ) : null
    );
  }
}

export default App;
