import { useState, useEffect } from 'react';

function Tag(props) {
    const {tag, title, len} = props;
    const featured = title !== tag ? "featured" : null;
    return <li title={len} className={featured}><a href={`/tags/${tag}`}>{title}</a></li>;
}

export default function TagsPage() {

    const [tags, setTags] = useState();

    useEffect(() => {
        document.title = "Теги";
        try {
            fetch('/data/tags.json')
                .then(d => d.json())
                .then(res => setTags(res));
        }
        catch(e) {
            console.warn("Could not fetch tags list");
        }
    }, []);

    return (
        <div className="place__page">
            <h2>Теги</h2>
            <p className="normal-text description">Все теги</p>
            <ul className="tags__list">
                {tags ?
                    tags.map(t => <Tag key={t.tag} {...t}/>)
                    :
                    null
                }
            </ul>
        </div>
    );

}
