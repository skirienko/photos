import React, { Component } from 'react';

class Video extends Component {

    render() {
        const {path, video} = this.props;
        return (
            <div className="stretch">
                <video controls src={`${path}/${video}`} width="100%" height="100%" />
            </div>
        );
    }
}

export default Video;