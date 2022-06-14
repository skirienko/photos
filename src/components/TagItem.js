import React from 'react';
import { NavLink } from 'react-router-dom';

class TagItem extends React.Component {

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
        const {date, descr, path, place, episode, photo, tag} = this.props;
        const hash = episode ? "e"+episode : tag;
        const link = `/${place}/${date}#${hash}`;
        const src = ["/data", path, photo].join('/');
        const classNames = ["results__item"];
        if (!date && this.props.album) {
            classNames.push("album");
        }

        return (<li className={classNames.join(' ')}>
            <NavLink to={link}>
                <div className="progressive-img">
                    <img src={src} alt="" width="240" height="160"
                        style={{opacity:this.state.opacity}}
                        onLoad={this.handleOnLoad.bind(this)}/></div>
                <div className="result__descr">{descr}</div>
            </NavLink>
            </li>);
    }
}

export default TagItem;