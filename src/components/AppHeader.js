import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import LinkOrSpan from './LinkOrSpan';


function AppHeader({albums, location}) {

    const links = [
      {path: '/', children: "Фотографии"}
    ];
    const parts = location.pathname.split('/');

    if (parts && parts.length > 2 && parts[0]==='') {
      const a = parts[1];
      if (albums && a in albums) {        
        const link = { path: `/${a}`, children: albums[a] };
        links.push(link);
      }
    }
    links.forEach(l => {if (l.path===location.pathname) l.path = null; });

    return (
      <header className="app__header">
        <h1 className="app__title">
          {links.map(l => <LinkOrSpan key={l.path} className="app__home" {...l}/>).reduce((a, b) => [a, ' › ', b])}
        </h1>
      </header>
    );
}

export default withRouter(AppHeader);