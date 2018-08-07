import React, { Component } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, NavLink } from 'react-router-dom';
import EventsList from './components/EventsList';
import EventPage from './components/EventPage';

class App extends Component {

  constructor({match}) {
    super();
    this.match = match;
    this.state = {
      event: null,
      events: null
    };
  }

  getEventIdFromMatchParams(params) {
    if (params.event) {
      return params.event;
    }
    return null;
  }

  render() {
    return (
      <Router>
      <div className="App">
        <header className="App-header">
          <h1 className="App-title"><NavLink to="/">Photos</NavLink></h1>
        </header>
        <div className="App-content">
          <Route exact path="/" component={EventsList}/>
          <Route path="/:place/:event" component={EventPage}/>
        </div>
      </div>
      </Router>
    );
  }
}

export default App;
