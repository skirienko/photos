import { useEffect } from 'react';
import EventListItem from './EventListItem';

export default function EventsList({events, setPageTitle}) {
    useEffect(() => {
        setPageTitle(null);
    }, [setPageTitle]);

    return (events ?
        <ul className="events__list">
            {events.map(item => <EventListItem key={item.date||item.album} {...item}></EventListItem>)}
        </ul>
        : null
    );
}
