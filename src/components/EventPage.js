import React from 'react';
import Episode from './Episode';

class EventPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
        }
        this.io = new IntersectionObserver(this.changeTitle.bind(this));
    }

    componentDidMount() {
        const placeId = this.props.match.params.place;
        const eventId = this.props.match.params.event;
        this.fetchItem(placeId, eventId);
    }

    async fetchJsonFile(filename) {
        try {
            const res = await fetch(filename);
            return await res.json();
        }
        catch(error) {
            return null;
        }
    }

    getItem(eventId) {
        return eventId in this.state ? this.state[eventId] : null;
    }

    async fetchItem(placeId, eventId) {
        let event = null;
        if (eventId in this.state) {
            event = this.state[eventId];
            document.title = event.title;
        }
        else {
            let path = `/data/${eventId}`;
            let result = await this.fetchJsonFile(`${path}/descr.json`);
            // second try
            if (!result) {
                let path = `/data/${placeId}/${eventId}`;
                result = await this.fetchJsonFile(`${path}/descr.json`);
            }

            if (result) {
                result.path = path;
                result.toc = result.episodes.filter(item => item.subtitle);
                const title = 'title' in result ? result.title : '';
                this.setState({
                    [eventId]: result,
                    title: title,
                });
            }
        }
        return event;
    }

    fetchPlace(placeId) {
        let place = null;
        if (placeId in this.state) {
            place = this.state[placeId];
        }
        else {
            fetch(`/data/${placeId}.json`).then(d => d.json()).then(result => {
                if (result) {
                    this.setState({[placeId]: result});
                }
            });
        }
        return place;
    }

    setTitle(subtitle) {
        const parts = [this.state.title];
        if (subtitle) {
            parts.push(subtitle);
        }
        document.title = parts.join(' – ');
    }

    changeTitle(entries) {
        let subtitle;
        const visibles = entries.filter(en => en.isIntersecting);
        if (visibles.length) {
            subtitle = visibles[0].target.innerText;
        }
        this.setTitle(subtitle)
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
                if (node.tagName==='H3')
                    this.setTitle(node.innerText);
            }
        }
        const targets = document.querySelectorAll(".event__subtitle");
        targets.forEach(t => this.io.observe(t))
    }

    renderDate(item) {
        // const placeId = this.props.match.params.place;
        // const place = this.fetchPlace(placeId);
        return (<p className="normal-text event__date">{item.date}</p>);
    }

    renderToc(data) {
        return data.toc && data.toc.length ? (<div className="event__toc">
                {data.toc
                    .map(item => (<a href={"#" + item.id} key={item.id}>{item.subtitle}</a>))
                    .reduce((prev, curr) => [prev, ' — ', curr])
                }
            </div>)
            :
            null;
    }

    render() {
        const eventId = this.props.match.params.event;
        const item = this.getItem(eventId);
        const nav = this.getNavLinks();

        this.setTitle();

        return item ?
            (<div className="event__page">
                <h2>{item.title}</h2>
                {this.renderDate(item)}
                {this.renderToc(item)}
                <p className="normal-text description">{item.description}</p>
                {item.episodes.map(episode => (<Episode episode={episode} event={eventId} key={episode.id} path={item.path} />))}
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