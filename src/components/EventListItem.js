import React from 'react';
import { NavLink } from 'react-router-dom';

class EventListItem extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            opacity: 0
        }
    }

    handleOnLoad() {
        this.setState({opacity: 1});
    }
    
    render() {
        const date = this.props.date;
        const place = this.props.place || this.props.city;
        const link = date ? "/"+place+"/"+date : "/"+place;
        const src = ["/data", date, this.props.img].join('/');
        const classNames = ["event-item"];
        if (!date && this.props.album) {
            classNames.push("album");
        }

        return (<li className={classNames.join(' ')}>
            <NavLink to={link}>
                <div className="progressive-img" style={{backgroundImage: `url(${this.props.thumb})`}}>
                    <img src={src} alt="" width="240" height="160"
                        style={{opacity:this.state.opacity}}
                        onLoad={this.handleOnLoad.bind(this)}/></div>
                <div className="event-title">{this.props.title}</div>
            </NavLink>
            </li>);
    }
}

export default EventListItem;