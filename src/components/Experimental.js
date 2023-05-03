import {useState} from 'react';
import { getScrollSnap, setScrollSnap } from '../App';

export default function Experimental() {

        function onCheckboxChange(e) {
            const checked = e.target.checked;
            setScrollSnap(checked);
            setSnap(checked);
        }

        let [snap, setSnap] = useState(getScrollSnap());

        return (<div className="experimental">
            <label><input type="checkbox" name="snap" checked={snap} onChange={onCheckboxChange}/> Экспериментальная прокрутка</label>
        </div>);
    
}
