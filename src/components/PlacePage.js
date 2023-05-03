import React from 'react';
import EventListItem from './EventListItem';

export default class PlacePage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            placeId: null,
            place: null,
        }
    }

    async fetchItem(placeId) {
        return await fetch(`/data/${placeId}/descr.json`).then(d => d.json());
    }

    async componentDidMount() {
        const placeId = this.props.match.params.place;
        const place = await this.fetchItem(placeId);
        this.setState({placeId: placeId, place: place});
    }

    render() {
        const {placeId, place} = this.state;
        if (place)
            document.title = place.title;
        return place ?
            (<div className="place__page">
                <h2>{place.title}</h2>
                <p className="normal-text description">{place.description}</p>
                <ul className="events__list">
                    {place.events.map(item => <EventListItem key={item.date} {...item} photo={placeId+'/'+item.photo} place={placeId}></EventListItem>)}
                </ul>
            </div>)
            :
            null;
    }
}
