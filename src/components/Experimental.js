import React from 'react';
import { getScrollSnap, setScrollSnap } from '../App';

class Experimental extends React.Component {

    constructor() {
        super();
        this.state = {
            snap: getScrollSnap(),
        }
    }

    onCheckboxChange(e) {
        const checked = e.target.checked;
        setScrollSnap(checked);
        this.setState({snap: checked});
    }    

    render() {
        const onCheckboxChange = this.onCheckboxChange.bind(this);

        return (<div className="experimental">
            <label><input type="checkbox" name="snap" checked={this.state.snap} onChange={onCheckboxChange}/> Экспериментальная прокрутка</label>
        </div>);
    }
    
}

export default Experimental;