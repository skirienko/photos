import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import EventListItem from './EventListItem';

export default function PlacePage() {

    const {place:placeId} = useParams();
    const [place, setPlace] = useState();

    useEffect(()=>{
        try {
            fetch(`/data/${placeId}/descr.json`)
                .then(d => d.json())
                .then(place => {
                    if (place) {
                        document.title = place.title;
                        setPlace(place);
                    }
                });

        }
        catch(e) {
            console.warn("Could not fetch data for place "+tag);
        }

    }, []);


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
