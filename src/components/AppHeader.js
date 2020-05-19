import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import LinkOrSpan from './LinkOrSpan';


export default class AppHeader extends Component {

  constructor() {
    super();
    this.state = {
      links: [{path: '/', children: "Фотографии"}]
    };
  }

  render() {
    const links = this.state.links;
    const ProperLink = withRouter((props) =>
          <LinkOrSpan path={props.path!==props.location.pathname ? props.path : null} className={props.className}>{props.children}</LinkOrSpan>);

    return (
      <header className="app__header">
        <h1 className="app__title">
          {links.map(link => <ProperLink key={link.path} path={link.path} className="app__home">{link.children}</ProperLink>).reduce((prev, curr) => [prev, ' › ', curr])}
        </h1>
      </header>
    );
  }
}