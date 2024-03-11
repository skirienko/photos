import {useState} from 'react';
import { NavLink } from 'react-router-dom';

const cut = s => s.split(". ")[0];

export default function Result(props) {
    const {descr, path, photo, hash} = props;
    const snip = props.snip ? props.snip : cut(descr);
    const link = `${path}#${hash}`;
    const src = ["/data", path, photo].join('/');

    let [opacity, setOpacity] = useState(0);

    function handleOnLoad() {
        setOpacity(1);
    }

    // link, src, descr
    // link=(place,date,hash), src=(path,photo), descr

    return (<li className="results__item" title={descr}>
        <NavLink to={link}>
            <div className="progressive-img">
                <img src={src} alt="" width="240" height="160"
                    style={{opacity:opacity}}
                    onLoad={handleOnLoad}/></div>
            <div className="result__descr">{snip}</div>
        </NavLink>
        </li>);
}
