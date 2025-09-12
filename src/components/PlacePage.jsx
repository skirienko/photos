import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import EventListItem from './EventListItem';

export default function PlacePage({setPageTitle}) {

    const {place:placeId} = useParams();
    const [place, setPlace] = useState();
    const navigate = useNavigate();
    const {hash} = useLocation();

    useEffect(()=>{
        try {
            fetch(`/data/${placeId}/descr.json`)
                .then(d => d.json())
                .then(place => {
                    if ("sections" in place) {
                        navigate(`/${place.place}/${place.date}${hash}`)
                    }
                    if (place) {
                        document.title = place.title;
                        setPlace(place);
                        setPageTitle(place.title);
                    }
                });
        }
        catch(e) {
            console.warn("Could not fetch data for place "+tag);
        }

    }, []);


    return place ?
        (<div className="place__page">
            <p className="normal-text description">{place.description}</p>
            <ul className="events__list">
                {place.events.map(item => <EventListItem key={item.date} {...item} photo={placeId+'/'+item.photo} place={placeId}></EventListItem>)}
            </ul>
        </div>)
        :
        null;
}
