import React from 'react';
import './Slot.css';

function Slot({ card , highlight , lock }) {
    let classNames = 'slot';
    classNames = lock ? classNames + ' lock' : classNames;
    classNames = highlight ? classNames + ' highlight' : classNames; 
    if (!card) {
        return (
            <div className={classNames}>
                Empty
            </div>
        )
    }
    return (
        <div className={classNames}>
            <div className="mana-cost">{card['manaCost']}</div>
            <div className="card-name">{card['name']}</div>
            <div className="card-text">{card['text']}</div>
        </div>
    )
}

export default Slot;