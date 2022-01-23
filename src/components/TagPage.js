import React from 'react';

class TagPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
        }
    }

    fetchItem(tag) {
        let place = null;
        if (placeId in this.state) {
            place = this.state[placeId];
            document.title = place.title;
        }
        else {
            fetch(`/data/${placeId}/descr.json`).then(d => d.json()).then(result => {
                if (result) {
                    this.setState({[placeId]:result});
                }
            });
        }
        return place;
    }


    render() {
        const tag = this.props.match.params.tag;
        const place = this.fetchItem(tag);

        return place ?
            (<div className="place__page">
                <h2>{place.title}</h2>
                <p className="normal-text description">{place.description}</p>
                <ul className="events__list">
                    {place.events.map(item => <EventListItem key={item.date} {...item} photo={placeId+'/'+item.photo} place={placeId}></EventListItem>)}
                </ul>
            </div>)
            :
            null;

    }
}

export default TagPage;