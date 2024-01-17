import React from 'react';
import { useParams } from 'react-router-dom';
import Section from './Section';
import paths from '../paths.json';

const JOINER = ' — ';

function Navigation({nav}) {
    return (nav && (nav.prev || nav.next)) ?
        <footer className="footer__navigation">
            {nav.prev ? <div className="footer-nav__prev"><a href={nav.prev.date}>{nav.prev.title}</a></div> : null}
            {nav.next ? <div className="footer-nav__next"><a href={nav.next.date}>{nav.next.title}</a></div> : null}
        </footer>
        :
        null;
}

function Toc({toc}) {
    return toc && toc.length ? (<nav className="event__toc">
            {toc
                .map(item => (<a href={"#" + item.id} key={item.id}>{item.subtitle}</a>))
                .reduce((prev, curr) => [prev, ' — ', curr])
            }
        </nav>)
        :
        null;
}

async function fetchItem(placeId, eventId, dataPath) {
    let path, parentPath;
    if (dataPath) {
        path = `/data/${dataPath}/${eventId}`;
        parentPath = `/data/${dataPath}`;
    }
    else {
        path = `/data/${eventId}`;
        parentPath = "/data";
    }
    const res = await fetchJsonFile(`${path}/descr.json`);

    if (res) {
        res.path = path;
        res.parentPath = parentPath;
        if ('sections' in res) {
            res.toc = res.sections.filter(s => s.title).map(s => ({id:s.id, subtitle:s.title}));
        }
        else if ('episodes' in res) {
            res.toc = res.episodes.filter(item => item.subtitle);
        }
    }

    return res;
}

async function fetchParent(path, eventId) {
    let parent = null;
    const res = await fetchJsonFile(`${path}/descr.json`);

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

async function fetchJsonFile(filename) {
    try {
        const res = await fetch(filename);
        return await res.json();
    }
    catch(error) {
        return null;
    }
}

function baseTitle(parent, event) {
    const arrTitle = [];
    if (parent && parent.title) {
        arrTitle.push(parent.title);
    }
    if (event && event.title) {
        arrTitle.push(event.title);
    }
    return arrTitle.join(JOINER);
}

function setDocumentTitle(base, subtitle) {
    const parts = [base];
    if (subtitle) {
        parts.push(subtitle);
    }
    document.title = parts.join(JOINER);
}

function withParams(Component) {
    return props => <Component {...props} params={useParams()} />;
}

class EventPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
        this.io = new IntersectionObserver(this.changeTitle.bind(this));
    }

    componentDidMount() {
        const {params} = this.props;
        const dataPath = paths[params.place];
        this.fetchItem(params.place, params.event, dataPath);
    }

    getItem(eventId) {
        return eventId in this.state ? this.state[eventId] : null;
    }

    async fetchItem(placeId, eventId, dataPath) {
        const res = await fetchItem(placeId, eventId, dataPath);

        if (res) {
            this.setState({[eventId]:res});
            const parentPath = res.parentPath;

            let parent;
            if (this.state[parentPath]) {
                parent = this.state[parentPath];
            }
            else {
                parent = await fetchParent(parentPath, eventId);
                this.setState({[parentPath]:parent});
            }
            this.setState({
                [eventId]: {...res, parent: parent},
                title: baseTitle(parent, res),
            });
        }
    }

    changeTitle(entries) {
        const visibles = entries.filter(en => en.isIntersecting);
        if (visibles.length) {
            const header = visibles[0].target.querySelectorAll("h3")[0];
            const subtitle = header ? header.innerText : null;
            setDocumentTitle(this.state.title, subtitle);
        }
    }

    componentDidUpdate() {
        let hash = document.location.hash.replace('#', '');
        if (hash) {
            let node = document.getElementById(hash);
            if (node) {
                node.scrollIntoView();
                if (node.tagName==='H3')
                    setDocumentTitle(this.state.title, node.innerText);
            }
        }
        const targets = document.querySelectorAll("main section");
        targets.forEach(t => this.io.observe(t))
    }

    render() {
        const eventId = this.props.params.event;
        const item = this.getItem(eventId);

        setDocumentTitle(this.state.title);

        var sections = null;
        if (item) {
            sections = 'sections' in item ? item.sections : [{id:'section-0', episodes: item.episodes}];
        }

        return item ?
            (<article className="event__page">
                <header>
                <h2 className="event__title">{item.title}</h2>
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

export default withParams(EventPage);
