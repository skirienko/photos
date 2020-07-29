import React, { Component } from 'react';

class Vimeo extends Component {

    constructor(props) {
        super(props);

        this.state = {
            params: {
                aspect:56.25 // by default 16:9
            },
        }
    }

    async componentDidMount() {
        const videoId = this.props.video;
        let params = null;
        try {
            params = (await (await fetch(`https://vimeo.com/api/v2/video/${videoId}.json`)).json())[0];
            if (params.height && params.width) {
                params.aspect = params.height / params.width * 100;
            }
            this.setState({params: params});
        }
        catch(error) {
            console.warn(`Could not get params for vimeo ${videoId}`);
        }
    }

    render() {
        const aspect = this.state.params.aspect;
        return (
            <div className="stretch">
                <div style={{padding:`${aspect}% 0 0 0`, position:'relative'}}>
                    <iframe src={'https://player.vimeo.com/video/'+this.props.video+'?byline=0&portrait=0&title=0&dnt=1'}
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