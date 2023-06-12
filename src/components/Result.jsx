import {useState} from 'react';
import { NavLink } from 'react-router-dom';

export default function Result(props) {
    const {descr, path, photo, hash} = props;
    const link = `${path}#${hash}`;
    const src = ["/data", path, photo].join('/');

    let [opacity, setOpacity] = useState(0);

    function handleOnLoad() {
        setOpacity(1);
    }

    // link, src, descr
    // link=(place,date,hash), src=(path,photo), descr

    return (<li className="results__item">
        <NavLink to={link}>
            <div className="progressive-img">
                <img src={src} alt="" width="240" height="160"
                    style={{opacity:opacity}}
                    onLoad={handleOnLoad}/></div>
            <div className="result__descr">{descr}</div>
        </NavLink>
        </li>);
}
