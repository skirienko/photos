import React from 'react';
import Episode from './Episode';

class EventPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
        }
    }

    fetchItem(eventId) {
        let event = null;
        if (eventId in this.state) {
            event = this.state[eventId];
            document.title = event.title;
        }
        else {
            fetch(`/data/${eventId}.json`).then(d => d.json()).then(result => {
                if (result) {
                    this.setState({[eventId]:result});
                }
            });
        }
        return event;
    }

    componentDidUpdate() {
        let hash = document.location.hash.replace('#', '');
        if (hash) {
            let node = document.getElementById(hash);
            if (node) {
                node.scrollIntoView();
            }
        }    
    }

    render() {
        const eventId = this.props.match.params.event;
        const item = this.fetchItem(eventId);

        return item ?
            (<div className="event-page">
                <h2>{item.title}</h2>
                <p className="event-date">{item.date}</p>
                <p className="description">{item.description}</p>
                {item.episodes.map(episode => (<Episode episode={episode} event={eventId} key={episode.id}></Episode>))}
            </div>)
            :
            null;
    }
    
}

export default EventPage;