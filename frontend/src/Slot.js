import React from 'react';
import './Slot.css';
import { Mana, replaceTextWithImages } from './Icons';

function Slot({ card , highlight , elements, lock , basic, onClick }) {
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
    
    let cardText = replaceTextWithImages(card['text']);

    elements.forEach(element => {   
        classNames += ' ' + element;
    });
    
    return (
        <div className={classNames} onClick={onClick}>
            <div className="mana-cost">{card['mana_cost']}
            <Mana/>
            </div>
            <div className="card-name">{card['name']}</div>
            <div className="card-text">{cardText}</div>
        </div>
    )
}

export default Slot;