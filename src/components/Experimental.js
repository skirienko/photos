import React from 'react';

const SNAP_NAME = "scrollSnap";

class Experimental extends React.Component {

    constructor() {
        super();
        const snap = !!localStorage.getItem(SNAP_NAME);
        this.state = {
            [SNAP_NAME]: snap,
        }
        this.setGlobalScrollSnap(snap);
    }

    setGlobalScrollSnap(snap) {
        const action = snap ? 'add' : 'remove';
        document.body.classList[action]('scroll-snap');
    }

    onCheckboxChange(e) {
        const checked = e.target.checked;
        if (checked)
            localStorage.setItem(SNAP_NAME, 1);
        else
            localStorage.removeItem(SNAP_NAME);

        this.setGlobalScrollSnap(checked);
        this.setState({[SNAP_NAME]: checked});
    }    

    render() {
        const onCheckboxChange = this.onCheckboxChange.bind(this);

        return (<div className="experimental">
            <label><input type="checkbox" name={SNAP_NAME} checked={this.state[SNAP_NAME]} onChange={onCheckboxChange}/> Экспериментальная прокрутка</label>
        </div>);
    }
    
}

export default Experimental;