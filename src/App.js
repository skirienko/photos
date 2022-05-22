import React, { Component } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import EventsList from './components/EventsList';
import PlacePage from './components/PlacePage';
import EventPage from './components/EventPage';
import TagsPage from './components/TagsPage';
import TagPage from './components/TagPage';
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

  constructor(props) {
    super(props);
    setScrollSnap(getScrollSnap());
    this.state = {
      events: null,
      albums: null,
    };
  }

  async componentDidMount() {
    fetch('/data/descr.json').then(d => d.json()).then(result => {
        if (result) {
          const events = result;
          const albums = {};
          events.filter(ev => 'album' in ev).forEach(ev => {
            albums[ev.album] = ev.title;
          });
          
          this.setState({events: events, albums: albums});
        }
    });      
  }

  getEventIdFromMatchParams(params) {
    if (params.event) {
      return params.event;
    }
    return null;
  }

  render() {
    const {albums, events} = this.state;

    return (
      <Router>
      <div className="app">
        <AppHeader albums={albums}/>
        <div className="app__content">
          <Switch>
            <Route exact path="/" render={props => <EventsList events={events} {...props}/>} />
            <Route exact path="/tags"><TagsPage/></Route>
            <Route path="/tags/:tag" render={props => <TagPage {...props}/>}/>
            <Route exact path="/:place" component={PlacePage}/>
            <Route path="/:place/:event" render={props => <EventPage {...props}/>}/>
          </Switch>
        </div>
        <footer className="app__footer">
          <Route exact path="/"><Experimental/></Route>
        </footer>
      </div>
      </Router>
    );
  }
}

export default App;
