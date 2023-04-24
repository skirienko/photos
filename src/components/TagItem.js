import {useState} from 'react';
import { NavLink } from 'react-router-dom';

export default function TagItem(props) {
    const {date, descr, path, place, episode, photo, tag} = props;
    const hash = episode ? "e"+episode : tag;
    const link = `/${place}/${date}#${hash}`;
    const src = ["/data", path, photo].join('/');
    const classNames = ["results__item"];
    if (!date && props.album) {
        classNames.push("album");
    }

    let [opacity, setOpacity] = useState(0);

    function handleOnLoad() {
        setOpacity(1);
    }

    return (<li className={classNames.join(' ')}>
        <NavLink to={link}>
            <div className="progressive-img">
                <img src={src} alt="" width="240" height="160"
                    style={{opacity:opacity}}
                    onLoad={handleOnLoad}/></div>
            <div className="result__descr">{descr}</div>
        </NavLink>
        </li>);
}
