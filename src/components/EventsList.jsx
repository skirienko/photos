import EventListItem from './EventListItem';

export default function EventsList({events, setPageTitle}) {

    setPageTitle(null);

    return (events ?
        <ul className="events__list">
            {events.map(item => <EventListItem key={item.date||item.album} {...item}></EventListItem>)}
        </ul>
        : null
    );
}
