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
        const place = this.fetchItem(placeId);

        return place ?
            (<div className="place__page">
                <h2>{place.title}</h2>
                <p className="normal-text description">{place.description}</p>
                <ul className="events__list">
                    {place.events.map(item => <EventListItem key={item.date} {...item} place={placeId}></EventListItem>)}
                </ul>
            </div>)
            :
            null;

    }
}

export default PlacePage;