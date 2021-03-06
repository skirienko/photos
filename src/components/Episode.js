import React from 'react';
import Photos from './Photos';
import Video from './Video';
import Vimeo from './Vimeo';

const rxTxt = /.*[^.:!? ]$/;

const mdify = (text) => {
    const splitter = /(\[[^\]]+\]\([^)]+\))/;
    const matcher = /^\[([^\]]+)\]\(([^)]+)\)$/;
    const lnk = (s) => {
        const m = s.match(matcher);
        return (<a href={m[2]} key={m[2]}>{m[1]}</a>);
    }
    return <>{text.split(splitter).map(s => matcher.test(s) ? lnk(s) : s)}</>;
}; 

const Episode = (props) => {
    const path = props.path;
    const episode = props.episode;
    if (episode.hide) {
        return null;
    }

    if ('subtitle' in episode) {
        const subtitle = episode.subtitle || '***';
        return <h3 id={episode.id} className="event__subtitle">{subtitle}</h3>
    }

    const style = episode.aspect ? {paddingBottom: episode.aspect+"%"} : null;

    let text = episode.descr;
    if (text && text.match(rxTxt)) {
        text += ":";
    }
    text = mdify(text);

    return (
        <div className="episode" id={`e${episode.id}`}>
        <p className="normal-text"><span className="cnt">{episode.id}.</span> {text}</p>
        {episode.photo ?
            <div className="stretch">
                <div className="photo" style={style}><img alt="" src={`${path}/${episode.photo}`} /></div>
            </div>
            :
            null
        }
        {episode.type==='video' ? <Video path={path} {...episode} /> : null}
        {episode.type==='vimeo' ? <Vimeo {...episode} /> : null}
        {episode.photos ? <Photos aspect={episode.aspect} photos={episode.photos} episode={episode.id} path={path} /> : null}
        </div>
    );
}

export default Episode;