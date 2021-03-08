import React, { Component } from 'react';

class Video extends Component {

    render() {
        const {path, video, poster} = this.props;
        return (
            <div className="stretch">
                <video controls src={`${path}/${video}`} width="100%" height="100%" poster={poster ? `${path}/${poster}` : null}/>
            </div>
        );
    }
}

export default Video;