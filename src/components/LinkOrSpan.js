import React from 'react';
import { Link } from 'react-router-dom'

export default function LinkOrSpan(props) {

    const {path, title, className} = props;

    return (path) ?
        <Link to={path} className={className}>{title}</Link>
        :
        <span className={className}>{title}</span>
}