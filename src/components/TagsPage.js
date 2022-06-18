import React from 'react';

function Tag(props) {
    const {tag, title, len} = props;
    const featured = title !== tag ? "featured" : null;
    return <li key={tag} title={len} className={featured}><a href={`/tags/${tag}`}>{title}</a></li>;
}

class TagsPage extends React.Component {

    constructor() {
        super();
        this.state = {};
    }

    async fetchTags() {
        if (!('tags' in this.state)) {
            const result = await fetch(`/data/tags.json`).then(d => d.json());
            if (result) {
                this.setState({tags: result});
            }
        }
    }

    async componentDidMount() {
        document.title = "Теги";
        await this.fetchTags();
    }

    render() {
        const tags = this.state.tags;
        return (
            <div className="place__page">
                <h2>Теги</h2>
                <p className="normal-text description">Все теги</p>
                <ul className="tags__list">
                    {tags ?
                        tags.map(t => <Tag {...t}/>)
                        :
                        null
                    }
                </ul>
            </div>)
        ;

    }
}

export default TagsPage;