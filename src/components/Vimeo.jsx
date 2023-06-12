import { useState, useEffect } from 'react';

export default function Vimeo({video, descr}) {

    const [aspect, setAspect] = useState(56.25); // by default 16:9

    useEffect(() => {
        try {
            fetch(`https://vimeo.com/api/v2/video/${video}.json`)
                .then(d => d.json())
                .then(res => {
                    const params = res[0];
                    if (params.height && params.width) {
                        setAspect(params.height / params.width * 100);
                    }
                });
        }
        catch(e) {
            console.warn(`Could not get params for vimeo ${video}`);
        }

    }, []); 

    return (
        <div className="stretch">
            <div style={{padding:`${aspect}% 0 0 0`, position:'relative'}}>
                <iframe src={'https://player.vimeo.com/video/'+video+'?byline=0&portrait=0&title=0&dnt=1'}
                    title={descr}
                    style={{position:'absolute',top:0,left:0,width:'100%',height:'100%'}} frameBorder="0" allowFullScreen>
                </iframe>
            </div>
            <script src="https://player.vimeo.com/api/player.js"></script>
        </div>
    );
}
