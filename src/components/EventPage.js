import React from 'react';
import Episode from './Episode';

class EventPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
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
            let parentPath = "/data";
            let result = await this.fetchJsonFile(`${path}/descr.json`);
            // second try
            if (!result) {
                path = `/data/${placeId}/${eventId}`;
                parentPath = `/data/${placeId}`;
                result = await this.fetchJsonFile(`${path}/descr.json`);
            }

            if (result) {
                result.path = path;
                result.parentPath = parentPath;
                result.toc = result.episodes.filter(item => item.subtitle);
                const title = 'title' in result ? result.title : '';
                this.setState({
                    [eventId]: result,
                    title: title,
                    parent: null,
                });

                if (!(parentPath in this.state)) {
                    this.fetchParent(parentPath, eventId).then(parent => {
                        if (parent) {
                            this.setState({
                                [parentPath]: parent,
                                [eventId]: {...this.state[eventId], parent: parent},
                            })
                        }
                    });
                }
            }
        }
        return event;
    }

    async fetchParent(path, eventId) {
        let parent = null;
        const res = await this.fetchJsonFile(`${path}/descr.json`);

        if (res) {
            const link = path.replace(/^\/data/, '');
            parent = {
                title: res.title,
                path: link
            };
            const events = res.events || res;
            if (events && events.length) {
                const idx = events.findIndex(item => item.date===eventId);
                if (idx > -1) {
                    parent.prev = idx > 0 ? events[idx - 1] : null;
                    parent.next = idx + 1 < events.length ? events[idx + 1] : null;
                }
            }
        }

        return parent;
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
        return (<p className="normal-text event__date">{item.date}</p>);
    }

    renderToc(props) {
        const toc = props.toc;
        return toc && toc.length ? (<div className="event__toc">
                {toc
                    .map(item => (<a href={"#" + item.id} key={item.id}>{item.subtitle}</a>))
                    .reduce((prev, curr) => [prev, ' — ', curr])
                }
            </div>)
            :
            null;
    }

    renderNavigation(props) {
        const nav = props.nav;
        return (nav && (nav.prev || nav.next)) ?
            <div className="footer__navigation">
                {nav.prev ? <div className="footer-nav__prev"><a href={nav.prev.date}>{nav.prev.title}</a></div> : null}
                {nav.next ? <div className="footer-nav__next"><a href={nav.next.date}>{nav.next.title}</a></div> : null}
            </div>
            :
            null;
    }

    render() {
        const eventId = this.props.match.params.event;
        const item = this.getItem(eventId);

        const Toc = this.renderToc;
        const Navigation = this.renderNavigation;

        this.setTitle();

        return item ?
            (<div className="event__page">
                <h2>{item.title}</h2>
                <p className="normal-text event__date">{item.date}</p>
                <Toc toc={item.toc} />
                <p className="normal-text description">{item.description}</p>
                {item.episodes.map(episode => (<Episode episode={episode} event={eventId} key={episode.id} path={item.path} />))}
                <Navigation nav={item.parent}/>
            </div>)
            :
            null;
    }
    
}

export default EventPage;