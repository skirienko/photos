import React, { Component } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, withRouter } from 'react-router-dom';
import EventsList from './components/EventsList';
import EventPage from './components/EventPage';
import ProperLink from './components/ProperLink';

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
    const ProperLinkWithRouter = withRouter((props) =>
          <ProperLink title={props.title} pathTo={props.path}
            currentPath={props.location.pathname} className={props.className}/>);
    
    return (
      <Router>
      <div className="app">
        <header className="app__header">
          <h1 className="app__title"><ProperLinkWithRouter title="Фотографии" path="/" className="app__home"/></h1>
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
