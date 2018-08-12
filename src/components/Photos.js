import React, { Component } from 'react';
import './Photos.css';


class Photos extends Component {

    constructor(props) {
        super(props);
        this.PREFIX = `/data/${props.event}/`;
        this.state = {
            selected: 0,
            dragStartX: null,
            drag: null,
            draggedFrom: null,
        };
    }

    select (i) {
        if (i >= 0 && i < this.props.photos.length) {
            this.setState({selected: i});
        }
    }
    next() {
        const newValue = (this.state.selected + 1) % this.props.photos.length;
        this.setState({selected: newValue});
    }

    prev() {
        const newValue = (this.state.selected - 1) % this.props.photos.length;
        this.setState({selected: newValue});
    }
    
    click(e) {
        if (this.state.draggedFrom===null) {
            e.preventDefault();
            this.next();
        }
        else {
            this.setState({draggedFrom: null})
        }
    }

    switchStart(e) {
        let x;
        if (e.type==='touchstart') {
            x = e.touches[0].clientX;
        }
        else {
            e.preventDefault();
            x = e.clientX;
        }
        this.setState({dragStartX: x});
    }

    switchMove(e) {
        if (e.buttons&1 || e.type==='touchmove') {
            let x = e.type==='touchmove' ? e.touches[0].clientX : e.clientX;
            let diffX = x - this.state.dragStartX;
            this.setState({drag: diffX});
            e.currentTarget.style.transform = `translate(${diffX}px)`
        }
        e.preventDefault();
    }

    switchEnd(e) {
        if (this.state.drag) {
            e.preventDefault();
            const w = e.currentTarget.offsetWidth;
            const shift = this.state.drag / w;
            const selected = this.state.selected;
            if (shift < -.25) {
                this.next();
            }
            else if (shift > .25) {
                this.prev();
            }
            this.setState({dragStartX: null, drag: null, draggedFrom: selected});
        }
    }

    getCounter() {
        if (this.props.photos.length <= 7) {
            const click = this.select.bind(this);
            return <span className="dots">
                {
                    this.props.photos.map((_, i) => (i===this.state.selected ? <a key={i}>●</a> : <a key={i} onClick={() => click(i)}>○</a>))
                }
            </span>;
        } else {
            return [this.state.selected+1, this.props.photos.length].join(' / ');
        }
    }

    render() {
        const photosStyle = this.props.aspect ? {paddingBottom: this.props.aspect+"%"} : null;
        const itemStyle = this.state.dragStartX ? null : {transform: 'translate(0)'};
        return (
        <div className="stretch">
          <div className="photos" style={photosStyle}>
            {this.props.photos.map((photo, i) => {
                const classes = ['photo'];
                if (i===this.state.selected) {
                    classes.push('selected');
                }
                return (<div key={photo} className={classes.join(' ')}
                            onClick={this.click.bind(this)}
                            onMouseDown={this.switchStart.bind(this)}
                            onTouchStart={this.switchStart.bind(this)}
                            onMouseMove={this.switchMove.bind(this)}
                            onTouchMove={this.switchMove.bind(this)}
                            onMouseUp={this.switchEnd.bind(this)}
                            onMouseLeave={this.switchEnd.bind(this)}
                            onTouchEnd={this.switchEnd.bind(this)}
                            style={itemStyle}>
                            <img src={this.PREFIX + photo} alt=""/>
                        </div>);
            })}
            <div className="counter">{this.getCounter()}</div>
          </div>
        </div>);
    }
}

export default Photos;