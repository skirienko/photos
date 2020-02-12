import React from 'react';
import { Link } from 'react-router-dom'

export default function LinkOrSpan(props) {

    const {path, children, ...rest} = props;

    return (path) ?
        <Link to={path} {...rest}>{children}</Link>
        :
        <span {...rest}>{children}</span>
}