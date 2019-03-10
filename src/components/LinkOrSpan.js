import React from 'react';
import { Link } from 'react-router-dom'

export default function LinkOrSpan(props) {

    const {path, content, ...rest} = props;

    return (path) ?
        <Link to={path} {...rest}>{content}</Link>
        :
        <span {...rest}>{content}</span>
}