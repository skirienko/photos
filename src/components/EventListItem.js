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
        const link = "/"+this.props.city+"/"+this.props.id;
        const src = ["/data", this.props.id, this.props.img].join('/');

        return (<li className="event-item">
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