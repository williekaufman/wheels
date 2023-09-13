import React from 'react';
import './Slot.css';

function Fireball() {
    return (
        <img className="icon" src="/images/fireball.png" alt="Fireball" />
    )
}

function GreenPlus() {
    return (
        <img className="icon" src="/images/green_plus.png" alt="Green Plus" />
    )
}

function WizardHat() {
    return (
        <img className="icon" src="/images/mage.svg" alt="Wizard Hat" />
    )
}

function Shield() {
    return (
        <img className="icon" src="/images/shield.svg" alt="Shield" />
    )
}

function Mana() {
    return (
        <img className="icon" src="/images/mana.png" alt="Mana" />
    )
}

function Slot({ card , highlight , lock , basic, onClick }) {
    let classNames = 'slot';
    classNames = lock ? classNames + ' lock' : classNames;
    classNames = highlight ? classNames + ' highlight' : classNames;
    classNames = basic ? classNames + ' basic' : classNames; 
   
    const replaceTextWithImages = (text) => {
        const parts = text.split(/\(([^)]+)\)/); // Split text by parentheses

        return parts.map((part, index) => {
            if (index % 2 === 1) {
                switch (part) {
                    case 'Damage':
                        return <Fireball className="icon" key={index} />;
                    case 'Heal':
                        return <GreenPlus className="icon" key={index} />;
                    case 'Block':
                        return <Shield className="icon" key={index} />;; 
                    case 'Spell_damage':
                        return <WizardHat className="icon" key={index} />;
                    case 'Mana':
                        return <Mana className="icon" key={index} />;
                    default:
                        return part;
                }
            } else {
                return part;
            }
        });
    };

    const render = (text) => {
        return (
            <div>
                {replaceTextWithImages(text)}
            </div>
        )
    }

    if (!card) {
        classNames = classNames + ' empty';
        return (
            <div className={classNames} onClick={onClick}>
                Empty
            </div>
        )
    }
    
    let cardText = replaceTextWithImages(card['text']);

    return (
        <div className={classNames} onClick={onClick}>
            <div className="mana-cost">{card['manaCost']}
            <Mana/>
            </div>
            <div className="card-name">{card['name']}</div>
            <div className="card-text">{cardText}</div>
        </div>
    )
}

export default Slot;