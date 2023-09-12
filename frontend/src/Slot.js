import React from 'react';
import './Slot.css';

function Slot({ card , highlight , lock , basic, onClick }) {
    let classNames = 'slot';
    classNames = lock ? classNames + ' lock' : classNames;
    classNames = highlight ? classNames + ' highlight' : classNames;
    classNames = basic ? classNames + ' basic' : classNames; 
    if (!card) {
        classNames = classNames + ' empty';
        return (
            <div className={classNames} onClick={onClick}>
                Empty
            </div>
        )
    }
    return (
        <div className={classNames} onClick={onClick}>
            <div className="mana-cost">{card['manaCost']}</div>
            <div className="card-name">{card['name']}</div>
            <div className="card-text">{card['text']}</div>
        </div>
    )
}

export default Slot;