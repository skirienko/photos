import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import LinkOrSpan from './LinkOrSpan';


class AppHeader extends Component {

  render () {
    const { albums, location } = this.props;
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

    return (
      <header className="app__header">
        <h1 className="app__title">
          {links.map(link => <LinkOrSpan key={link.path} path={link.path !== location.pathname ? link.path : null} className="app__home">{link.children}</LinkOrSpan>).reduce((a, b) => [a, ' › ', b])}
        </h1>
      </header>
    );
  }
}

export default withRouter(AppHeader);