import React, { Component } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Route from './route';
import './App.scss';

class App extends Component {
  showCurrentYear() {
    return new Date().getFullYear();
  }
  render() {
    return (
      <Router>
        <header>
          testnet: <span>{process.env.REACT_APP_CHAIN_ID}</span>
        </header>
        <Route />
        <footer>
          &copy; {this.showCurrentYear()} <span>MXNC - a DLI Project</span>
        </footer>
      </Router>
    );
  }
}

export default App;
