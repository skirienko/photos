import React from 'react';
import Episode from './Episode';

class Section extends React.Component {

    render() {
        const {id, title, episodes, path} = this.props;
        if (!episodes)
            return null;

        return (<section id={id}>
            {title ? <h3 className="event__subtitle">{title}</h3> : null}
            {episodes.map(episode => (<Episode episode={episode} key={episode.id} path={path} />))}
        </section>);
    }
}

export default Section;