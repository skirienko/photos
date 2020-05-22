import React from 'react';
import EventListItem from './EventListItem';

class EventsList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            events: props.events
        };
    }

    componentDidMount() {
        document.title = "Фотографии";
        if (!this.state.events) {
            fetch('/data/descr.json').then(d => d.json()).then(result => {
                if (result) {
                  this.setState({events: result});
                }
              });      
        }
    }

    render() {
        if (!this.state.events) {
            return null;
        }
    
        return (<ul className="events__list">
                {this.state.events.map(item => <EventListItem key={item.date||item.album} {...item}></EventListItem>)}
            </ul>);
    
    }
}

export default EventsList;