import React, { Component } from 'react';

class Vimeo extends Component {

    render() {
        return (
            <div className="stretch">
                <div style={{padding:'56.25% 0 0 0', position:'relative'}}>
                    <iframe src={'https://player.vimeo.com/video/'+this.props.video+'?byline=0&portrait=0'}
                        title={this.props.descr}
                        style={{position:'absolute',top:0,left:0,width:'100%',height:'100%'}} frameBorder="0" allowFullScreen>
                    </iframe>
                </div>
                <script src="https://player.vimeo.com/api/player.js"></script>
            </div>
        );
    }
}

export default Vimeo;