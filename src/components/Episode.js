import React from 'react';
import Photos from './Photos';

const Episode = (props) => {
    const PREFIX = `/data/${props.event}/`;
    if (props.episode.hide) {
        return null;
    }
    const style = props.episode.aspect ? {paddingBottom: props.episode.aspect+"%"} : null;
    return (
        <div className="episode" id={`episode-${props.episode.id}`}>
        <p>{props.episode.id}. {props.episode.descr}</p>
        {props.episode.photo ?
            <div className="stretch">
                <div className="photo" style={style}><img alt="" src={PREFIX + props.episode.photo} /></div>
            </div>
            :
            null
        }
        {props.episode.photos ? <Photos aspect={props.episode.aspect} photos={props.episode.photos} event={props.event}/> : null}
        </div>
    );
}

export default Episode;