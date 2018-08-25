import React from 'react';
import { NavLink } from 'react-router-dom';

const EventListItem = (props) => {
    console.log(props)
    return (<li className="event-item">
        <NavLink to={"/"+props.city+"/"+props.id}>
            <img src={["/data", props.id, props.img].join('/')} alt="" width="240" height="160"/>
            <div>{props.title}</div>
        </NavLink>
        </li>);
}

export default EventListItem;