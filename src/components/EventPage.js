import React from 'react';
import Section from './Section';

const JOINER = ' — ';

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
                if ('sections' in result) {
                    result.toc = result.sections.filter(s => s.title).map(s => ({id:s.id, subtitle:s.title}));
                }
                else if ('episodes' in result) {
                    result.toc = result.episodes.filter(item => item.subtitle);
                }
                const parent = this.state[parentPath] || null;
                this.setState({
                    [eventId]: result,
                    parent: parent,
                    title: this.baseTitle(parent, result),
                });
                
            }

            if (!(parentPath in this.state)) {
                const parent = await this.fetchParent(parentPath, eventId);
                if (parent) {
                    this.setState({
                        [parentPath]: parent,
                        [eventId]: {...this.state[eventId], parent: parent},
                        title: this.baseTitle(parent, result),
                    })
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

    baseTitle(parent, event) {
        const arrTitle = [];
        if (parent && parent.title) {
            arrTitle.push(parent.title);
        }
        if (event && event.title) {
            arrTitle.push(event.title);
        }
        return arrTitle.join(JOINER);
    }

    setTitle(subtitle) {
        const parts = [this.state.title];
        if (subtitle) {
            parts.push(subtitle);
        }
        document.title = parts.join(JOINER);
    }

    changeTitle(entries) {
        const visibles = entries.filter(en => en.isIntersecting);
        if (visibles.length) {
            const header = visibles[0].target.querySelectorAll("h3")[0];
            const subtitle = header ? header.innerText : null;
            this.setTitle(subtitle);
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
        const targets = document.querySelectorAll("main section");
        targets.forEach(t => this.io.observe(t))
    }

    renderDate(item) {
        return (<p className="normal-text event__date">{item.date}</p>);
    }

    renderToc(props) {
        const toc = props.toc;
        return toc && toc.length ? (<nav className="event__toc">
                {toc
                    .map(item => (<a href={"#" + item.id} key={item.id}>{item.subtitle}</a>))
                    .reduce((prev, curr) => [prev, ' — ', curr])
                }
            </nav>)
            :
            null;
    }

    renderNavigation(props) {
        const nav = props.nav;
        return (nav && (nav.prev || nav.next)) ?
            <footer className="footer__navigation">
                {nav.prev ? <div className="footer-nav__prev"><a href={nav.prev.date}>{nav.prev.title}</a></div> : null}
                {nav.next ? <div className="footer-nav__next"><a href={nav.next.date}>{nav.next.title}</a></div> : null}
            </footer>
            :
            null;
    }

    render() {
        const eventId = this.props.match.params.event;
        const item = this.getItem(eventId);

        const Toc = this.renderToc;
        const Navigation = this.renderNavigation;

        this.setTitle();

        var sections = null;
        if (item) {
            sections = 'sections' in item ? item.sections : [{id:'section-0', episodes: item.episodes}];
        }

        return item ?
            (<article className="event__page">
                <header>
                <h2>{item.title}</h2>
                    <p className="normal-text event__date">{item.date}</p>
                    <Toc toc={item.toc} />
                    <p className="normal-text description">{item.description}</p>
                </header>
                <main>
                    {sections.map(sec => (<Section key={sec.id} path={item.path} {...sec} />))}
                </main>
                <Navigation nav={item.parent}/>
            </article>)
            :
            null;
    }
    
}

export default EventPage;