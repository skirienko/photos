import React, { Component } from 'react';
import './Photos.css';

const DEBOUNCE_RATE = 500;

class Photos extends Component {

    constructor(props) {
        super(props);
        this.len = props.photos.length;
        this.PREFIX = `/data/${props.event}/`;
        this.jsxFrames = {
            'prev': null,
            'curr': null,
            'next': null,
        };
        this.state = {
            transition: false,
            selected: 0,
            dragStartX: null,
            drag: null,
            draggedFrom: null,
        };
        this.debouncedNext = this.debounce(this.next, DEBOUNCE_RATE).bind(this);
        this.debouncedPrev = this.debounce(this.prev, DEBOUNCE_RATE).bind(this);
    }

    cycle(num) {
        const mod = this.props.photos.length;
        return ((num % mod) + mod) % mod;
    }

    debounce(f, ms) {
        let occupied = false;
        let context = this;

        return function () {
            if (!occupied) {
                occupied = true;
                f.apply(context, arguments);

                setTimeout(() => {
                    occupied = false;
                }, ms);
        
            }
        }
    }

    select(i) {
        this.setState({selected: this.cycle(i)});
    }
    
    next(el) {
        const newValue = this.cycle(this.state.selected + 1);
        el.style.transform = 'translate(-100%)';
        this.setState({selected: newValue});
    }

    prev(el) {
        const newValue = this.cycle(this.state.selected - 1);
        el.style.transform = 'translate(100%)';
        this.setState({selected: newValue});
    }

    restore(el) {
        el.style.transform = null;
    }
    
    click(e) {
        if (this.state.draggedFrom===null) {
            e.preventDefault();
            this.next(e.currentTarget);
        }
        else {
            this.setState({draggedFrom: null})
        }
    }

    wheel(e) {
        if (e.deltaX && Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
            const el = e.currentTarget;
            if(e.deltaX > 0) {
                this.debouncedNext(el);
            }
            else {
                this.debouncedPrev(el);
            }
            e.preventDefault();
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
            const el = e.currentTarget;
            const w = e.currentTarget.offsetWidth;
            const shift = this.state.drag / w;
            const selected = this.state.selected;
            if (shift < -.1) {
                this.next(el);
            }
            else if (shift > .1) {
                this.prev(el);
            }
            else {
                this.restore(el);
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

    renderFrame(frame) {
        const jsxFrame = (
            <div key={frame.type+frame.photo} className={'photo '+frame.type} {...frame.events}>
                <img src={this.PREFIX + frame.photo} alt=""/>
            </div>
        );
        this.jsxFrames[frame.type] = jsxFrame;
        return jsxFrame;
    }

    render() {
        const photosStyle = this.props.aspect ? {paddingBottom: this.props.aspect+"%"} : null;

        const currIdx = this.state.selected % this.len;
        const prevIdx = (currIdx - 1) % this.len;
        const nextIdx = (currIdx + 1) % this.len;

        const frames = [
            {type: 'prev', photo: this.props.photos[prevIdx]},
            {type: 'curr', photo: this.props.photos[currIdx], events: {
                onClick: this.click.bind(this),
                onMouseDown: this.switchStart.bind(this),
                onTouchStart: this.switchStart.bind(this),
                onMouseMove: this.switchMove.bind(this),
                onTouchMove: this.switchMove.bind(this),
                onMouseUp: this.switchEnd.bind(this),
                onMouseLeave: this.switchEnd.bind(this),
                onTouchEnd: this.switchEnd.bind(this),
                onWheel: this.wheel.bind(this),
        }},
            {type: 'next', photo: this.props.photos[nextIdx]},
        ];

        return (
            <div className="stretch">
              <div className="photos" style={photosStyle}>
                { frames.map(frame => this.renderFrame(frame)) }
              <div className="counter">{this.getCounter()}</div>
              </div>
            </div>
          );
    }
}

export default Photos;