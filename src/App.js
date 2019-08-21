import React, { Component } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, withRouter } from 'react-router-dom';
import EventsList from './components/EventsList';
import PlacePage from './components/PlacePage';
import EventPage from './components/EventPage';
import LinkOrSpan from './components/LinkOrSpan';
import Experimental from './components/Experimental';

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
          <LinkOrSpan content={props.content}
            path={props.path!==props.location.pathname ? props.path : null}
            className={props.className}/>);
    
    return (
      <Router>
      <div className="app">
        <header className="app__header">
          <h1 className="app__title"><ProperLink content="Фотографии" path="/" className="app__home"/></h1>
        </header>
        <div className="app__content">
          <Route exact path="/" component={EventsList}/>
          <Route exact path="/:place" component={PlacePage}/>
          <Route path="/:place/:event" component={EventPage}/>
        </div>
        <footer className="app__footer">
          <Route exact path="/" component={Experimental}/>
        </footer>
      </div>
      </Router>
    );
  }
}

export default App;
