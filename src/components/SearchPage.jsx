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
    return <>{txt.split(splitter).map((w,i) => w.toLowerCase()===t ? <mark key={w+i}>{w}</mark> : mark(w, rest))}</>;
};

function highlight(res) {
    if (res.terms && res.terms.length) {
        res.snip = mark(res.descr, res.terms);
    }
    return res;
}

const SEARCH_URL = '/api/search';
export default function SearchPage({setPageTitle}) {

    const [results, setResults] = useState([]);
    const [searchParams] = useSearchParams();
    setPageTitle("Поиск");

    function runSearch(q) {
        if (q) {
            fetch(SEARCH_URL+'?q='+q)
                .then(d => d.json())
                .then(results => results.map(highlight)).then(setResults)
        }
    }

    const q = searchParams.get('q');
    useEffect(() => {
        document.title = "Поиск: "+q;
        runSearch(q);
    }, [q]);

    return (
        <div className="place__page">
            <p className="normal-text description">{q}</p>
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
