import React from 'react';
import './Slot.css';
import { Mana, replaceTextWithImages } from './Icons';
import { useEffect, useRef } from 'react';

function ShrinkingTextComponent({ text , color , className }) {
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
        <div style={{color: color}} ref={containerRef} className={className}>
            {text}
        </div>
    );
}

function ManaTemplate({ mana }) {
    if (mana != 0 && !mana) {
        return null;
    }
    return (
        <div className="mana-cost">
            {mana}
            <Mana />
        </div>
    )
}

function Slot({ card , highlight , elements, lock , player, failed, basic, onClick , title , hero }) {
    let classNames = 'slot';
    classNames = lock ? classNames + ' lock' : classNames;
    classNames = highlight ? classNames + ' highlight' : classNames;
    classNames = basic ? classNames + ' basic' : classNames; 
    classNames = hero ? classNames + ' hero' : classNames;
    
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

    elements.forEach(element => {   
        classNames += ' ' + element;
    });
    
    return (
        <div title={title} className={classNames} onClick={onClick}>
            <ManaTemplate mana={card['mana_cost']}/>
            <ShrinkingTextComponent className="card-name" color={failed ? 'red' : 'black'} text={card['name']} /> 
            <ShrinkingTextComponent className="card-text" color='black' text={replaceTextWithImages(card['text'])} />
            </div>
    )
}

export default Slot;