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
            dragX: null,
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
    
    next() {
        const newValue = this.cycle(this.state.selected + 1);
        this.setState({selected: newValue});
    }

    prev() {
        const newValue = this.cycle(this.state.selected - 1);
        this.setState({selected: newValue});
    }

    restore() {
        this.setState({dragX: null});
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

    wheel(e) {
        if (e.deltaX && Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
            e.preventDefault();
            if (e.deltaX > 0) {
                this.debouncedNext();
            }
            else {
                this.debouncedPrev();
            }
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
            this.setState({dragX: diffX});
        }
        e.preventDefault();
    }

    switchEnd(e) {
        if (this.state.dragX) {
            e.preventDefault();
            const el = e.currentTarget;
            const w = e.currentTarget.offsetWidth;
            const shift = this.state.dragX / w;
            const selected = this.state.selected;
            if (shift < -.5) {
                this.next(el);
            }
            else if (shift > .1) {
                this.prev(el);
            }
            else {
                this.restore();
            }
            this.setState({dragStartX: null, dragX: null, draggedFrom: selected});
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
        const photosStyle = {
            paddingBottom: this.props.aspect ? this.props.aspect+"%" : null,
            transform: this.state.dragX ? `translate(${this.state.dragX}px)` : null,
        };

        const currIdx = this.state.selected % this.len;
        const prevIdx = (this.len + currIdx - 1) % this.len;
        const nextIdx = (currIdx + 1) % this.len;

        const frames = [
            {type: 'prev', photo: this.props.photos[prevIdx]},
            {type: 'curr', photo: this.props.photos[currIdx]},
            {type: 'next', photo: this.props.photos[nextIdx]},
        ];
        let frameEvents = {
            onClick: this.click.bind(this),
            onMouseDown: this.switchStart.bind(this),
            onTouchStart: this.switchStart.bind(this),
            onMouseMove: this.switchMove.bind(this),
            onTouchMove: this.switchMove.bind(this),
            onMouseUp: this.switchEnd.bind(this),
            onMouseLeave: this.switchEnd.bind(this),
            onTouchEnd: this.switchEnd.bind(this),
            onWheel: this.wheel.bind(this),
        };
        return (
            <div className="stretch">
              <div className="photos" style={photosStyle} {...frameEvents}>
                { frames.map(frame => this.renderFrame(frame)) }
              <div className="counter">{this.getCounter()}</div>
              </div>
            </div>
          );
    }
}

export default Photos;