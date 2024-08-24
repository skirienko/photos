import React, {useState} from 'react';
import { NavLink } from 'react-router-dom';

export default function EventListItem(props) {
    const {date, title, photo, thumb} = props;
    const place = props.place;
    const link = date ? "/"+place+"/"+date : "/"+place;
    const src = ["/data", photo].join('/');
    const classNames = ["events__item"];
    if (!date && props.album) {
        classNames.push("album");
    }

    let [opacity, setOpacity] = useState(0);

    function handleLoad() {
        setOpacity(1);
    }

    return (<li className={classNames.join(' ')}>
        <NavLink to={link}>
            <div className="progressive-img" style={{backgroundImage: `url(${thumb})`}}>
                <img src={src} alt="" width="240" height="160"
                    style={{opacity:opacity}}
                    onLoad={handleLoad}/></div>
            <div className="event-title">{title}</div>
        </NavLink>
        </li>);
}
