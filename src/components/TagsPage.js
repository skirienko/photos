import React from 'react';

class TagsPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    fetchTags() {
        let tags = null;
        document.title = "Теги";
        if (tags in this.state) {
            tags = this.state.tags;
        }
        else {
            fetch(`/data/tags.json`).then(d => d.json()).then(result => {
                if (result) {
                    this.setState({tags:result});
                }
            });
        }
        return tags;
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
                        tags.map(t => <li><a href={`/tags/${t.tag}`}>{t.tag}</a>: {t.len}</li>)
                        :
                        null
                    }
                </ul>
            </div>)
        ;

    }
}

export default TagsPage;