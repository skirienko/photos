import LinkOrSpan from './LinkOrSpan';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

export default function AppHeader({albums}) {

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

    return (
      <header className="app__header">
        <h1 className="app__title">
          {links.map(l => <LinkOrSpan key={l.path} className="app__home" {...l}/>).reduce((a, b) => [a, ' › ', b])}
        </h1>
        <form className="app__search" action="/search" >
          <input type="search" name="q" placeholder="&#x2315;"/>
        </form>
      </header>
    );
}
