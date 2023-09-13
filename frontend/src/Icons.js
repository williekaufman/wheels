import React from 'react';

export function Fireball() {
    return (
        <img className="icon" src="/images/fireball.png" alt="Fireball" title="Damage"/>
    )
}

export function GreenPlus() {
    return (
        <img className="icon" src="/images/green_plus.png" alt="Green Plus" title="Heal"/>
    )
}

export function WizardHat() {
    return (
        <img className="icon" src="/images/mage.svg" alt="Wizard Hat" title="Spell Damage"/>
    )
}

export function Shield() {
    return (
        <img className="icon" src="/images/shield.svg" alt="Shield" title="Block"/>
    )
}

export function DamageReduction() {
    return (
        <img className="icon" src="/images/damage_resistance.png" alt="Damage Resistance" title="Damage Resistance"/>
    )
}

export function Mana() {
    return (
        <img className="icon" src="/images/mana.png" alt="Mana" title="Mana"/>
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
                case 'Damage Reduction':
                    return <DamageReduction className="icon" key={index} />;
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

