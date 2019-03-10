import React from 'react';

export default function ProperLink(props) {

    const {pathTo, currentPath, title, className} = props;

    return (pathTo===currentPath) ?
        <span className={className}>{title}</span>
        :
        <a href={pathTo} className={className}>{title}</a>
}