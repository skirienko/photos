import React from 'react';
import EventListItem from './EventListItem';

class PlacePage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
        }
    }

    fetchItem(placeId) {
        let place = null;
        if (placeId in this.state) {
            place = this.state[placeId];
            document.title = place.title;
        }
        else {
            fetch(`/data/${placeId}.json`).then(d => d.json()).then(result => {
                if (result) {
                    this.setState({[placeId]:result});
                }
            });
        }
        return place;
    }


    render() {
        const placeId = this.props.match.params.place;
        const item = this.fetchItem(placeId);

        return item ?
            (<div className="place-page">
                <h2>{item.title}</h2>
                <p className="normal-text description">{item.description}</p>
                <ul className="events-list">
                    {item.events.map(item => <EventListItem key={item.id} {...item}></EventListItem>)}
                </ul>
            </div>)
            :
            null;

    }
}

export default PlacePage;