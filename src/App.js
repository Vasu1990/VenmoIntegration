import React, { Component } from 'react';
import { client, venmo, dataCollector } from 'braintree-web';
import './App.css';

var TCP_REACT_APP = {}

class App extends Component {
  constructor(props) {
    super(props);
    this.venmoButtonRef = null;
    this.venmoInstance = null;
    this.state = {
      isProcessing : true,
      inErroState: false,
      nonceDetails: null
    }
    this.handleVenmoError = this.handleVenmoError.bind(this);
    this.handleVenmoSuccess = this.handleVenmoSuccess.bind(this);
    this.startTokenization = this.startTokenization.bind(this);
    this.startTokenization = this.startTokenization.bind(this)
    }

  componentDidMount() {
    this.createClientInstance();
  }

  createClientInstance = () => {
    client.create({
      authorization: 'sandbox_tb4zs8qs_sn2qnrfxhd898t8h'
    },  (clientErr, clientInstance) => {
      // Stop if there was a problem creating the client.
      // This could happen if there is a network error or if the authorization
      // is invalid.
      if (clientErr) {
        console.error('Error creating client:', clientErr);
        return;
      }
    
      // Create a Venmo component.
      venmo.create({
        client: clientInstance,
        allowNewBrowserTab: false
      },  (venmoErr, venmoInstance) => {
        // Stop if there was a problem creating Venmo.
        // This could happen if there was a network error or if it's incorrectly
        // configured.
        if (venmoErr) {
          console.error('Error creating Venmo:', venmoErr);
          this.setState({inErroState: true ,isProcessing: false});
          return;
        }

        this.setState({isProcessing: false} , () => {
          this.venmoInstance = venmoInstance;
        });

    
        // ...
      });
    });
  }

  startTokenization = () => {
    this.venmoInstance.tokenize()
      .then((payload)  => {
       this.handleVenmoSuccess(payload);
    }).catch( (tokenizeError) => {
      this.handleVenmoError(tokenizeError);
    });
  };

  onVenmoClick = () => {
    this.startTokenization(this.venmoInstance);
  }
  
  handleVenmoError = (err) => {
    console.error('An error occurred:', err);
    this.setState({inErroState: true ,isProcessing: false}, () => {
      if (err.code === 'VENMO_CANCELED') {
        console.log('App is not available or user aborted payment flow');
      } else if (err.code === 'VENMO_APP_CANCELED') {
        console.log('User canceled payment flow');
      } else {
        console.error('An error occurred:', err.message);
      }
    });

  }

  handleVenmoSuccess = (payload) => {
    console.log(payload,"payload");
    // dataCollector.create({
    //   client: 'clientInstnace',
    //   paypal: true,
    // }).then((dataCollectorInstance) => {
    //     const {deviceData} = dataCollectorInstance;
    //     console.log("tokenization success");
    //     //send nonce
    //     //send device data for txn
    // });
    this.setState({nonceDetails : payload})
    console.log("tokenization success");
    console.log('Got a payment method nonce:', payload.nonce);
    // Display the Venmo username in your checkout UI.
    console.log('Venmo user:', payload.details.username);
  }


   render = () => {

    return (
      this.state.isProcessing ? (
      <h2>creating client</h2>
      ) : this.state.inErroState ? <h2>error processing payment</h2> : 
      this.state.nonceDetails ?
        <div>
        <h2>Nonce Details</h2>
         Nonce: {this.state.nonceDetails.nonce}
         Username: {this.state.nonceDetails.details.username}
         <a id="backToApp" href="tcpmobile://checkout?venmo">back to app</a>
       </div>
       : 
       <div>
        <h2>start tokenization</h2>
         <button onClick={this.startTokenization}>start tokenization</button>
       </div>
    );
  }
}

export default App;
