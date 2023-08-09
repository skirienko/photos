import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Result from './Result';

/**
 * Convert text to JSX with <mark>term</mark> inside
 * @param {string} txt text to convert
 * @param {Array} terms terms to mark in the text
 * @return {Object} JSX object
 */
function mark(txt, terms) {
    const t = terms[0];
    if (!t)
        return txt;

    const rest = terms.slice(1);
    const splitter = new RegExp(`(${t})`, 'i');
    return <>{txt.split(splitter).map((w,i) => w.toLowerCase()===t ? <mark>{w}</mark> : mark(w, rest))}</>;
};

function highlight(res) {
    if (res.terms && res.terms.length) {
        res.descr = mark(res.descr, res.terms);
    }
    return res;
}

const SEARCH_URL = '/api/search';
export default function SearchPage() {

    const [results, setResults] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();

    function handleSubmit(event) {
        runSearch(event.target);
        event.preventDefault();
    }

    function runSearch(form) {
        if (form.q && form.q.value) {
            const q = form.q.value.trim()
            fetch(SEARCH_URL+'?q='+q)
                .then(d => d.json())
                .then(results => results.map(highlight)).then(setResults)
            setSearchParams({q})
        }
    }

    useEffect(() => {
        if (searchParams.get('q')) {
            runSearch(document.forms['search']);
        }
    }, []);

    return (
        <div className="place__page">
            <h2>Поиск</h2>
            <div>
                <form onSubmit={handleSubmit} name="search">
                    <input type="search" name="q" defaultValue={searchParams.get('q')}/>
                </form>
            </div>
            {
                results.length?
                <div>
                    <ul className="results__list">
                        {results.map(r => <Result key={r.id} {...r}></Result>)}
                    </ul>
                </div>
                : searchParams.get('q') ?
                <p>Ничего не найдено</p>
                : null
            }
        </div>
    );

}
