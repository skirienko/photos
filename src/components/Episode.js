import React from 'react';
import Photos from './Photos';
import Video from './Video';
import Vimeo from './Vimeo';

const rxTxt = /.*[^.:!? ]$/;

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
        {episode.photos ? <Photos aspect={episode.aspect} photos={episode.photos} episode={episode.id} event={props.event} path={path} /> : null}
        </div>
    );
}

export default Episode;