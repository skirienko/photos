import Episode from './Episode';

export default function Section({id, title, episodes, path}) {

    if (!episodes)
        return null;

    return (<section id={id}>
        {title ? <h3 className="event__subtitle">{title}</h3> : null}
        {episodes.map(episode => (<Episode episode={episode} key={episode.id} path={path} />))}
    </section>);
}
