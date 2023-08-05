import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Result from './Result';

const SEARCH_URL = '/api/search';
export default function SearchPage() {

    const [results, setResults] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();

    function runSearch(event) {
        const form = event.target;
        if (form && form.q && form.q.value) {
            const q = form.q.value.trim()
            fetch(SEARCH_URL+'?q='+q)
                .then(d => d.json())
                .then(setResults)
            setSearchParams({q})
        }
        event.preventDefault();
    }

    return (
        <div className="place__page">
            <h2>Поиск</h2>
            <div>
                <form onSubmit={runSearch}>
                    <input type="search" name="q" defaultValue={searchParams.get('q')}/>
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
