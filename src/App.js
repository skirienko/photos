import React, { Component } from 'react';
import './App.css';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import EventsList from './components/EventsList';
import PlacePage from './components/PlacePage';
import EventPage from './components/EventPage';
import AppHeader from './components/AppHeader';
import Experimental from './components/Experimental';

const SNAP_NAME = "scrollSnap";

export function getScrollSnap() {
  return !!localStorage.getItem(SNAP_NAME);
}

export function setScrollSnap(value) {
  let oldValue = getScrollSnap();

  if (value !== oldValue) {
    if (value)
      localStorage.setItem(SNAP_NAME, 1);
    else
      localStorage.removeItem(SNAP_NAME);
  }

  const action = value ? 'add' : 'remove';
  document.querySelector('html').classList[action]('scroll-snap');
}


class App extends Component {

  constructor() {
    super();
    setScrollSnap(getScrollSnap());
    this.state = {
      event: null,
      events: null,
      links: [{path: '/', children: "Фотографии"}]
    };
  }

  getEventIdFromMatchParams(params) {
    if (params.event) {
      return params.event;
    }
    return null;
  }

  async setSecondLink(link) {
    const links = [...this.state.links];
    if (link) {
      if (!links[1] || links[1].path !== link.path || links[1].children !== link.children) {
        links[1] = link;
        this.setState({links:links});
      }
    }
    else if (links[1]) {
      console.log(link);
      console.log(links);
      delete links[1];
      this.setState({links:links});
    }
  }

  render() {
    // not working not done
    const setSecondLink = this.setSecondLink.bind(this);
    return (
      <Router>
      <div className="app">
        <AppHeader/>
        <div className="app__content">
          <Route exact path="/" component={EventsList}/>
          <Route exact path="/:place" component={PlacePage}/>
          <Route path="/:place/:event" render={(props) => <EventPage setSecondLink={setSecondLink} {...props}/>}/>
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
