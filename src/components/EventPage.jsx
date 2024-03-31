import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Section from './Section';
import paths from '../paths.json';

const JOINER = ' — ';

function usePageTitle() {
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState();
    useEffect(() => {
        const parts = [title];
        if (subtitle)
            parts.push(subtitle);
        const full = parts.join(JOINER);
        if (full !== document.title) {
            document.title = full;
        }
    }, [title, subtitle]);
    return [setTitle, setSubtitle];
}

function Navigation({nav}) {
    const Arr = ({o, dir}) => (
        o ? <div className={`footer-nav__${dir}`}><a href={'/'+o.data_path}>{o.title}</a></div> : null
    )
    return (nav && (nav.prev || nav.next)) ?
        <footer className="footer__navigation">
            <Arr o={nav.prev} dir="prev"/>
            <Arr o={nav.next} dir="next"/>
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

export default function EventPage() {
    const {place, event} = useParams();
    const {hash} = useLocation();
    const [data, setData] = useState();
    const [setTitle, setSubtitle] = usePageTitle();

    useEffect(() => {
        async function fetchData() {
            if (data)
                return;
            try {
                const dataPath = paths[place];
                const res = await fetchItem(place, event, dataPath);
                if (res) {
                    if (!res['sections']) {
                        res['sections'] = [{id:'section-0', episodes: res.episodes}];
                    }
                    const parent = await fetchParent(res.parentPath, event);
                    res['parent'] = parent;
    
                    setTitle(baseTitle(parent, res));
                    setData(res);
                }
            }
            catch(e) {
                console.warn("Could not fetch data");
                console.warn(e);
            }    
        }
        fetchData();
    }, []);
    // scroll to hashed place
    useEffect(() => {
        if (data && data['sections']) {
            if (hash) {
                const node = document.querySelector(hash);
                if (node) {
                    node.scrollIntoView();
                }
            }
        }
    }, [data]);

    // page title 
    useEffect(() => {
        function changeSubtitle(entries) {
            let subtitle;
            const visibles = entries.filter(ntr => ntr.isIntersecting);
            if (visibles.length) {
                const header = visibles.map(v => v.target.querySelector("h3")).filter(h=>h)[0]
                subtitle = header ? header.innerText : null;
            }
            setSubtitle(subtitle);
        }
        if (data && data['sections']) {
            const io = new IntersectionObserver(changeSubtitle);
            const targets = document.querySelectorAll("main section");
            targets.forEach(t => io.observe(t))    
        }
    }); // yes, on every rerender

    return data && data['sections'] ?
        <article className="event__page">
            <header>
                <h2 className="event__title">{data.title}</h2>
                <p className="normal-text event__date">{data.date}</p>
                <Toc toc={data.toc} />
                <p className="normal-text description">{data.description}</p>
            </header>
            <main>
                {data.sections.map(sec => (<Section key={sec.id} path={data.path} {...sec} />))}
            </main>
            <Navigation nav={data.parent}/>
        </article>
    : null;
}