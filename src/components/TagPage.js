import React from 'react';
import EventListItem from './EventListItem';

class TagPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
        }
        this.tagName = this.props.match.params.tag;
    }

    async fetchItem(tagName) {
        let data = null;
        if (tagName in this.state) {
            data = this.state[tagName];
            document.title = data.title;
        }
        else {
            const result = await fetch(`/data/tags/${tagName}.json`).then(d => d.json());
            if (result) {
                this.setState({[tagName]: result});
            }
        }
    }


    async componentDidMount() {
        await this.fetchItem(this.tagName);
    }

    render() {
        const data = this.state[this.tagName] || null;
        console.log(data)

        const placeId = '';
        return data ?
            (<div className="place__page">
                <h2>{data.title}</h2>
                <p className="normal-text description">{data.description}</p>
                <ul className="events__list">
                    {data.map(item => <EventListItem key={item.date} {...item} photo={placeId+'/'+item.photo} place={placeId}></EventListItem>)}
                </ul>
            </div>)
            :
            null;

    }
}

export default TagPage;