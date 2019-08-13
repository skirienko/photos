import React from 'react';
import Episode from './Episode';

class EventPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
        }
    }

    fetchItem(eventId) {
        let event = null;
        if (eventId in this.state) {
            event = this.state[eventId];
            document.title = event.title;
        }
        else {
            fetch(`/data/${eventId}.json`).then(d => d.json()).then(result => {
                if (result) {
                    result.toc = result.episodes.filter(item => item.subtitle);
                    this.setState({[eventId]:result});
                }
            });
        }
        return event;
    }

    getNavLinks() {
        return {
            prev: {title: "Prev", url: "#"},
            next: {title: "Next", url: "#"},
        }
    }

    componentDidUpdate() {
        let hash = document.location.hash.replace('#', '');
        if (hash) {
            let node = document.getElementById(hash);
            if (node) {
                node.scrollIntoView();
            }
        }    
    }

    renderToc(data) {
        return data.toc && data.toc.length ? (<div className="event__toc">
                {data.toc
                    .map(item => (<a href={"#" + item.code} key={item.code}>{item.subtitle}</a>))
                    .reduce((prev, curr) => [prev, ' — ', curr])
                }
            </div>)
            :
            null;
    }

    render() {
        const eventId = this.props.match.params.event;
        const item = this.fetchItem(eventId);
        const nav = this.getNavLinks();

        return item ?
            (<div className="event__page">
                <h2>{item.title}</h2>
                <p className="normal-text event__date">{item.date}</p>
                {this.renderToc(item)}
                <p className="normal-text description">{item.description}</p>
                {item.episodes.map(episode => (<Episode episode={episode} event={eventId} key={episode.id}></Episode>))}
                <div className="footer footer__navigation">
                    <div>
                        <a href={nav.prev.url}>{nav.prev.title}</a>
                    </div>
                    <div>
                        <a href={nav.next.url}>{nav.next.title}</a>
                    </div>
                </div>
            </div>)
            :
            null;
    }
    
}

export default EventPage;