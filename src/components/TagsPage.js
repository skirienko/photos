import React from 'react';

class TagsPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    async fetchTags() {
        let tags = null;
        document.title = "Теги";
        if (tags in this.state) {
            tags = this.state.tags;
        }
        else {
            const result = await fetch(`/data/tags.json`).then(d => d.json());
            if (result) {
                this.setState({tags: result});
            }
        }
    }

    async componentDidMount() {
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
                        tags.map(t => <li key={t.tag} title={t.len}><a href={`/tags/${t.tag}`}>{t.tag}</a></li>)
                        :
                        null
                    }
                </ul>
            </div>)
        ;

    }
}

export default TagsPage;