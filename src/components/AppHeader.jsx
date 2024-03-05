import LinkOrSpan from './LinkOrSpan';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function AppHeader({albums}) {

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    let location = useLocation();

    let links = getHeaderParts(location);

    useEffect(() => {
        links = getHeaderParts(location)
    }, [location]);

    function getHeaderParts(location) {
        const links = [
            {path: '/', children: "Фотографии"}
        ];
        const parts = location.pathname.split('/');

        if (parts && parts.length > 2 && parts[0]==='') {
          const a = parts[1];
          if (albums && a in albums) {        
            links.push({ path: `/${a}`, children: albums[a] });
          }
          else if (parts[1]==='tags') {
            links.push({ path: '/tags', children: "Теги" });
          }
        }

        links.forEach(l => {if (l.path===location.pathname) l.path = null; });
        return links;  
    }

    function handleSubmit(ev) {
      const inp = ev.target.q;
      if (inp) {
        inp.value = inp.value.trim();
        if (inp.value) {
          navigate(`/search?q=${inp.value}`);
        }
        else {
          inp.focus();
        }
      }
      ev.preventDefault();
    }

    return (
      <header className="app__header">
        <h1 className="app__title">
          {links.map(l => <LinkOrSpan key={l.path} className="app__home" {...l}/>).reduce((a, b) => [a, ' › ', b])}
        </h1>
        <form className="app__search" action="/search" onSubmit={handleSubmit}>
          <input type="search" className="app_search-input" name="q" placeholder=" " defaultValue={searchParams.get('q')}/>
          <button className="app__search-button"><svg viewBox="0 0 16 16" fill="none">
            <circle cx="6.5" cy="6.5" r="5.75"/>
            <line x1="11" y1="11" x2="15" y2="15" strokeLinecap="round"/>
            </svg></button>
        </form>
      </header>
    );
}
