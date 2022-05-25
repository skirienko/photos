import React from 'react';
import EventListItem from './EventListItem';

class TagPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {}
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
                const data = this.prepareData(result['items']);
                this.setState({[tagName]: {title: result['title'], data: data}});
            }
        }
    }

    prepareData(rawData) {
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

    async componentDidMount() {
        document.title = "Всё с тегом "+this.tagName;
        await this.fetchItem(this.tagName);
    }

    render() {
        const data = this.state[this.tagName] || null;

        return data ?
            (<div className="place__page">
                <h2 className="event__title">{data.title}</h2>
                <p className="normal-text description">{data.description}</p>
                {data.data.map(section => (
                <div key={section.path}>
                    <h3 className="event__subtitle">{section.title}</h3>
                    <ul className="events__list">
                        {section.items.map(item => <EventListItem key={item.date+item.episode} {...item} photo={item.path+'/'+item.photo}></EventListItem>)}
                    </ul>
                </div>))}
            </div>)
            :
            null;

    }
}

export default TagPage;