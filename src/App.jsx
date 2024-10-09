import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EventsList from './components/EventsList';
import PlacePage from './components/PlacePage';
import EventPage from './components/EventPage';
import TagsPage from './components/TagsPage';
import SearchPage from './components/SearchPage';
import TagPage from './components/TagPage';
import AppHeader from './components/AppHeader';
import Experimental from './components/Experimental';
import './App.css';


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

function Footer() {
  return (
    <>
      <p className="tags-link"><a href="/tags">Теги</a></p>
      <p className="tags-link"><a href="/search">Поиск</a></p>
      <Experimental/>
    </>
  );
}


export default function App() {

  const [albums, setAlbums] = useState();
  const [events, setEvents] = useState();
  
  useEffect(()=>{
    setScrollSnap(getScrollSnap());
  }, []);

  useEffect(() => {
    fetch('/data/descr.json')
        .then(d => d.json())
        .then(result => {
          if (result) {
            setEvents(result);
            const albums = {};
            result.filter(ev => 'album' in ev).forEach(ev => {
              albums[ev.album] = ev.title;
            });
            setAlbums(albums);
          }
        });
  }, []);

  return (
    <Router>
      <div className="app">
        <AppHeader albums={albums}/>
  
        <div className="app__content">
          <Routes>
            <Route path="/" element={<EventsList events={events}/>} />
            <Route path="tags">
              <Route index element={<TagsPage />} />
              <Route path=":tag" element={<TagPage />} />
            </Route>
            <Route path="search" element={<SearchPage />}/>
            <Route path=":place">
              <Route index element={<PlacePage />}/>
              <Route path=":event" element={<EventPage />}/>
            </Route>
          </Routes>
        </div>
  
        <footer className="app__footer">
          <Routes>
            <Route path="/" element={<Footer/>}/>
            <Route path="*" element={null}/>
          </Routes>
        </footer>
      </div>
    </Router>
  );
}