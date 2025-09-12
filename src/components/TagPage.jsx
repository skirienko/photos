import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Result from './Result';

function prepareData(rawData) {
    let sections = {};
    let data = [];
    rawData.forEach(d => {
        const key = d.path;
        if (!(key in sections)) {
            const section = {
                path: d.path,
                date: d.date,
                title: d.title,
                items: [],
            }
            sections[key] = section;
        }
        sections[key].items.push(d);
    });
    data = Object.values(sections);
    data.sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0)
    return data;
}

export default function TagPage({setPageTitle}) {

    const {tag} = useParams();
    const [data, setData] = useState();
    const [title, setTitle] = useState('');
    const [aliases, setAliases] = useState([]);

    useEffect(() => {
        document.title = "Всё с тегом "+tag;
        try {
            fetch(`/data/tags/${tag}.json`)
                .then(d => d.json())
                .then(res => {
                    if (res) {
                        setData(prepareData(res['items']));
                        setTitle(res['title']);
                        setPageTitle(res['title']);
                        setAliases(res['tags']);
                    }
                });

        }
        catch(e) {
            console.warn("Could not fetch data for tag "+tag);
        }
    }, []);

    return data ?
        (<div className="place__page">
            <p className="normal-text result__tags">{aliases.join(" ")}</p>
            {data.map(section => (
            <div key={section.path}>
                <h3 className="event__subtitle">{section.title}</h3>
                <ul className="results__list">
                    {section.items.map(item => <Result key={item.date+item.hash} {...item}></Result>)}
                </ul>
            </div>))}
        </div>)
        :
        null;
}
