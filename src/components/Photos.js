import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import animate from 'dom-helpers/transition/animate';
import LinkOrSpan from './LinkOrSpan';
import './Photos.css';

const TRANSITION_TIME = 500;

class Photos extends Component {

    constructor(props) {
        super(props);
        this.len = props.photos.length;
        this.PREFIX = `/data/${props.event}/`;
        this.episode = props.episode;
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
        this.debouncedNext = this.debounce(this.next, TRANSITION_TIME).bind(this);
        this.debouncedPrev = this.debounce(this.prev, TRANSITION_TIME).bind(this);
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
        this.reset(newValue);
    }

    prev() {
        const newValue = this.cycle(this.state.selected - 1);
        this.reset(newValue);
    }

    restore() {
        this.reset();
    }
 
    reset(newValue) {
        let state = {
            dragStartX: null,
            dragX: null,
            animating: null,
        };
        if (typeof newValue !== 'undefined') {
            state.selected = newValue;
        }
        this.setState(state);
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
        const MIN_WHEEL_LEN = 10;
        const absX = Math.abs(e.deltaX);
        const absY = Math.abs(e.deltaY);
        if (absX && absX > absY) {
            if (absX > MIN_WHEEL_LEN || e.deltaMode > WheelEvent.DOM_DELTA_PIXEL) {
                if (!this.state.animating) {
                    const dir = (e.deltaX > 0) ? 'next' : 'prev';
                    this.glide(e.currentTarget, dir);
                }    
            }
        }
    }

    switchStart(e) {
        const src = (e.type==='touchstart') ? e.touches[0] : e;
        if (e.cancelable) {
            e.preventDefault();
        }
        this.setState({dragStartX: src.clientX, dragStartY: src.clientY, transition: true});
    }

    switchMove(e) {
        let src;
        if (e.buttons&1) {
            src = e;
        }
        if (e.type==='touchmove') {
            src = e.touches[0];           
        }

        if (src) {
            let diffX = src.clientX - this.state.dragStartX;
            let diffY = src.clientY - this.state.dragStartY;
            if (Math.abs(diffX) > Math.abs(diffY)) {
                this.setState({dragX: diffX});
            }
        }
    }

    switchEnd(e) {
        if (this.state.dragX) {
            const el = e.currentTarget;
            const w = el.offsetWidth;
            const shift = this.state.dragX / w;
            this.setState({draggedFrom: this.state.selected, transition: false});
            if (shift < -.1) {
                this.glide(el, 'next');
            }
            else if (shift > .1) {
                this.glide(el, 'prev');
            }
            else {
                this.glide(el, 'restore');
            }
            if (e.cancelable) {
                e.preventDefault();
            }
        }
    }

    glide(el, direction) {
        if (el) {
            this.setState({animating:true});
            const w = el.offsetWidth;
            let to, callback;
            switch(direction) {
                case 'next':
                    to = -w;
                    callback = this.next;
                    break;
                case 'prev':
                    to = w;
                    callback = this.prev;
                    break;
                default:
                    to = 0;
                    callback = this.restore;
            }
            // transition time should depend on length to glide (even linear is better than const)
            const time = Math.abs(this.state.dragX - to) / w * TRANSITION_TIME;
            animate(el, {translate: to+'px'}, time, 'ease-out', () => {
                this.setState({dragX:to});
                callback.call(this);
            });    
        }
    }

    getHash(i) {
        return `e${this.episode}.p${i}`;
    }

    getPrevArrow(currIdx) {
        const click = this.select.bind(this);
        const i = currIdx - 1;

        return <Link to={'#'+this.getHash(i)} className="arr arr__prev" onClick={() => click(i)}>&lt;</Link>
    }

    getNextArrow(currIdx) {
        const click = this.select.bind(this);
        const i = currIdx + 1;
        
        return <Link to={'#'+this.getHash(i)} className="arr arr__next" onClick={() => click(i)}>&gt;</Link>
    }

    getCounter() {
        const items = this.props.photos;
        const click = this.select.bind(this);

        const CounterDot = ({i}) => {
            const hash = this.getHash(i);
            return (i===this.state.selected) ?
                <LinkOrSpan>●</LinkOrSpan>
                :
                <LinkOrSpan path={'#'+hash} onClick={() => click(i)}>○</LinkOrSpan>
        }

        if (items.length <= 7) {
            return <span className="counter__dots">
                { items.map((_, i) => <CounterDot key={i} i={i}/>) }
            </span>;
        } else {
            return [this.state.selected+1, items.length].join(' / ');
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
        const frameEvents = {
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
              <div className="frame">
                <div className={'photos '+(this.state.transition ? 'grabbing':'')} style={photosStyle} {...frameEvents}>
                  { frames.map(frame => this.renderFrame(frame)) }
                </div>
                {this.getPrevArrow(currIdx)}
                {this.getNextArrow(currIdx)}
                <div className="counter">{this.getCounter()}</div>
              </div>
            </div>
          );
    }
}

export default Photos;