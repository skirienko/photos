import React from 'react';
import EventListItem from './EventListItem';

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


    render() {
        const tags = this.fetchTags();
        return (
            <div className="place__page">
                <h2>Теги</h2>
                <p className="normal-text description">Все теги</p>
                <ul className="events__list">
                    {tags ?
                        tags.map(item => <EventListItem key={item.date} {...item} photo={placeId+'/'+item.photo} place={placeId}></EventListItem>)
                        :
                        null
                    }
                </ul>
            </div>)
        ;

    }
}

export default TagsPage;