import React from 'react';
import { NavLink } from 'react-router-dom';

const EventListItem = (props) => {
    return (<li><NavLink to={"/istanbul/"+props.id}>{props.title}</NavLink></li>);
}

export default EventListItem;