import React, { Component } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, withRouter } from 'react-router-dom';
import EventsList from './components/EventsList';
import EventPage from './components/EventPage';
import LinkOrSpan from './components/LinkOrSpan';

class App extends Component {

  constructor() {
    super();
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
    const ProperLink = withRouter((props) =>
          <LinkOrSpan title={props.title}
            path={props.path!==props.location.pathname ? props.path : null}
            className={props.className}/>);
    
    return (
      <Router>
      <div className="app">
        <header className="app__header">
          <h1 className="app__title"><ProperLink title="Фотографии" path="/" className="app__home"/></h1>
        </header>
        <div className="app__content">
          <Route exact path="/" component={EventsList}/>
          <Route path="/:place/:event" component={EventPage}/>
        </div>
      </div>
      </Router>
    );
  }
}

export default App;
