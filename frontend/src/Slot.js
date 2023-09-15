import React from 'react';
import './Slot.css';
import { Mana, replaceTextWithImages } from './Icons';
import { useEffect, useRef } from 'react';

function ShrinkingTextComponent({ text , color }) {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const containerWidth = container.offsetWidth;
        let fontSize = parseInt(window.getComputedStyle(container).fontSize, 10);

        while (container.scrollWidth > containerWidth && fontSize > 10) {
            fontSize -= 1;
            container.style.fontSize = `${fontSize}px`;
        }
    }, [text]);

    return (
        <div style={{color: color}} ref={containerRef} className="card-name">
            {text}
        </div>
    );
}

function Slot({ card , highlight , elements, lock , player, failed, basic, onClick , title }) {
    let classNames = 'slot';
    classNames = lock ? classNames + ' lock' : classNames;
    classNames = highlight ? classNames + ' highlight' : classNames;
    classNames = basic ? classNames + ' basic' : classNames; 
    
    if (player) {
        classNames = classNames + ' ' + player;
    }

    if (!card) {
        classNames = classNames + ' empty';
        return (
            <div title={title} className={classNames} onClick={onClick}>
                Empty
            </div>
        )
    }
    
    let cardText = replaceTextWithImages(card['text']);

    elements.forEach(element => {   
        classNames += ' ' + element;
    });
    
    return (
        <div title={title} className={classNames} onClick={onClick}>
            <div className="mana-cost">{card['mana_cost']}
            <Mana/>
            </div>
            <ShrinkingTextComponent color={failed ? 'red' : 'black'} text={card['name']} />
            <div className="card-text">{cardText}</div>
            </div>
    )
}

export default Slot;