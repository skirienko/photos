import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Result from './Result';

export default function SearchPage() {

    const [results, setResults] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        document.title = "Поиск";
        try {
            fetch('/data/tags.json')
                .then(d => d.json())
                .then(res => setTags(res));
        }
        catch(e) {
            console.warn("Could not fetch tags list");
        }
    }, []);

    function runSearch(e) {
        const form = e.target;
        if (form && form.q && form.q.value) {
            const q = form.q.value.trim()
            console.log(q)
            fetch('//localhost:5005/search?q='+q)
                .then(d => d.json())
                .then(setResults)

        }
        e.preventDefault();
    }

    return (
        <div className="place__page">
            <h2>Поиск</h2>
            <div>
                <form onSubmit={runSearch}>
                    <input type="search" name="q"/>
                </form>
            </div>
            {
                results?
                <div>
                    <ul className="results__list">
                        {results.map(r => <Result key={r.id} {...r}></Result>)}
                    </ul>
                </div>
                :null
            }
        </div>
    );

}
