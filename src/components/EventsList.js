import {useState, useEffect} from 'react';
import EventListItem from './EventListItem';

export default function EventsList(props) {

    const [events, setEvents] = useState(props.events);

    useEffect(() => {
        document.title = "Фотографии";
        if (!events || !events.length) {
            try {
                fetch('/data/descr.json')
                    .then(d => d.json())
                    .then(res => setEvents(res));
            }
            catch(e) {
                console.warn("Could not fetch data");
            }
        }
    }, []);

    return (events ?
        <ul className="events__list">
            {events.map(item => <EventListItem key={item.date||item.album} {...item}></EventListItem>)}
        </ul>
        : null
    );

}
