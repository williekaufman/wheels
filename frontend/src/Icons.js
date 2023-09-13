import React from 'react';

export function Fireball() {
    return (
        <img className="icon" src="/images/fireball.png" alt="Fireball" />
    )
}

export function GreenPlus() {
    return (
        <img className="icon" src="/images/green_plus.png" alt="Green Plus" />
    )
}

export function WizardHat() {
    return (
        <img className="icon" src="/images/mage.svg" alt="Wizard Hat" />
    )
}

export function Shield() {
    return (
        <img className="icon" src="/images/shield.svg" alt="Shield" />
    )
}

export function Mana() {
    return (
        <img className="icon" src="/images/mana.png" alt="Mana" />
    )
}

function formatSynergyNumber(number) {
    return <span style={{ color: 'green' }}>{number}</span>;
}

export function replaceTextWithImages (text) {
    const parts = text.split(/\(([^)]+)\)/);

    return parts.map((part, index) => {
        if (index % 2 === 1) {
            switch (part) {
                case 'Damage':
                    return <Fireball className="icon" key={index} />;
                case 'Heal':
                    return <GreenPlus className="icon" key={index} />;
                case 'Block':
                    return <Shield className="icon" key={index} />;;
                case 'Spell Damage':
                    return <WizardHat className="icon" key={index} />;
                case 'Mana':
                    return <Mana className="icon" key={index} />;
                default:
                    return part;
            }
        } else {
            const synergyMatch = part.match(/SYNERGY:(\d+)/);
            if (synergyMatch) {
                return formatSynergyNumber(synergyMatch[1]);
            }
            return part;
        }
    });
};

