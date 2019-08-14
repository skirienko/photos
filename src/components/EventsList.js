import React from 'react';
import EventListItem from './EventListItem';

class EventsList extends React.Component {

    constructor() {
        super();
        this.state = {
            events: null
        };
    }

    componentDidMount() {
        document.title = "Фотографии";
        fetch('/data/all-events.json').then(d => d.json()).then(result => {
            if (result) {
              this.setState({events: result});
            }
          });      
    }

    render() {
        if (!this.state.events) {
            return null;
        }
    
        return (<ul className="events-list">
                {this.state.events.map(item => <EventListItem key={item.id} {...item}></EventListItem>)}
            </ul>);
    
    }
}

export default EventsList;