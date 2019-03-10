import React from 'react';
import Photos from './Photos';
import Vimeo from './Vimeo';

const Episode = (props) => {
    const PREFIX = `/data/${props.event}/`;
    const episode = props.episode;
    if (episode.hide) {
        return null;
    }

    const style = episode.aspect ? {paddingBottom: episode.aspect+"%"} : null;
    return (
        <div className="episode" id={`episode-${episode.id}`}>
        <p className="normal-text"><span className="cnt">{episode.id}.</span> {episode.descr}</p>
        {episode.photo ?
            <div className="stretch">
                <div className="photo" style={style}><img alt="" src={PREFIX + episode.photo} /></div>
            </div>
            :
            null
        }
        {episode.video ?
            <Vimeo {...episode}></Vimeo>
            :
            null
        }
        {episode.photos ? <Photos aspect={episode.aspect} photos={episode.photos} episode={episode.id} event={props.event}/> : null}
        </div>
    );
}

export default Episode;