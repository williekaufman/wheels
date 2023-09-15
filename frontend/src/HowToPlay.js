import React from 'react';
import './HowToPlay.css';
import { useEffect } from 'react';
import { WizardHat, Fireball, GreenPlus, Shield, DamageReduction, Experience, Draw, Mana, Focus } from './Icons.js';
import Button from '@mui/material/Button';

const HowToPlay = ({ onClose }) => {
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    const handleOverlayClick = (event) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="overlay" onClick={handleOverlayClick}>
            <div className="content">
                <h2> How Does This Game Work </h2>
                    <p> If you actually have no idea, probably ask someone who knows - I'm not really trying to make it understandable with no context. </p>
                    <p> That said, here's a quick overview: </p>
                    <p> Each turn, you'll cast up to 4 spells, one on each of the spellbooks associated with an element below. </p>
                    <p> Spells have a mana cost in the top right and effects at the bottom. See the 'Icons' section for the meaning of them. If you attempt to cast a spell you can't pay for, it simply has no effect (and you don't lose any mana). </p>
                    <p> To do so, you take two fundamental actions: playing cards from your hand (at the bottom of the screen), and 'spinning', which means rerolling which spell you're casting from your non-locked spellbooks. </p>
                    <p> When you submit your turn, you and your opponents will play all your cards from left to right, and then spin all your spellbooks, do 'once per turn' actions like drawing a card and gaining mana from your focus, and then repeat until someone dies. </p> 
                <h2> How to Use This Site </h2>
                    <p> To see a list of all the cards and build a deck, you can go to the decks page, located at the base URL slash decks. </p>
                    <p> To play a card, click on it from your hand, and then the spellbook you want to add it to. Cards in your hand are colored by the spellbooks they can be added to. Cards get a benefit when they are placed in a spellbook based on that spellbook's specialty, which you can see right above their lock button. </p>
                    <p> To (un)lock a spellbook, click the (un)lock button above it. </p>
                    <p> To spin, click the spin button or Shift + S. </p>
                    <p> To submit, click the submit button or Shift + Enter. </p>
                    <p> If you're running a server locally or you run localStorage.setItem('spellbooks-admin', true) in a console, you can submit for your opponent with Ctrl + Shift + Enter (even if you don't actually have an opponent) to make testing stuff easier. </p>
                    <p> You can look at a debug log produced by the server by clicking show log. The top row is the most recent event. </p>
                <h2> Stats and Icons </h2>
                <p>
                    <div style={{ color: 'blue' }}> Blue: instantaneous effects. </div>
                    <div style={{ color: 'red' }}> Red: Resets to zero every turn. </div>
                    <div style={{ color: 'green' }}> Green: permanent buffs to your character. </div>
                </p>
                <p style={{ color: 'blue' }}> <Mana /> Mana: Increases the player's current mana pool </p>
                <p style={{ color: 'green' }}> <Focus /> Focus: Increases the player's mana generation per turn. </p>
                <p style={{ color: 'red' }}> <WizardHat /> Spell Damage: Increases the damage of your spells. </p>
                <p style={{ color: 'blue' }}> <Fireball /> Damage: Deals damage to the opponent. </p>
                <p style={{ color: 'blue' }}> <GreenPlus /> Heal: Heals the player. Negative means pay life. </p>
                <p style={{ color: 'red' }}> <Shield /> Block: Blocks damage. </p>
                <p style={{ color: 'red' }}> <DamageReduction /> Damage Resistance: Reduces damage taken from damaging spells (per instance of damage). </p>
                <p style={{ color: 'green' }}> <Experience /> Experience: Increases spins per turn. </p>
                <p style={{ color: 'blue' }}> <Draw /> Draw: Draws cards from the deck. </p>
                <p> </p>
                <h2> Mechanical details </h2>
                <p> When you play a card, it goes into a random empty spot in that spellbook. This could be the slot that's currently active, in which case you'll cast it (unless you spin it away). Cards cannot be removed from spellbooks. </p>
                <p> Air always goes first, then earth, then fire, then water. For each element, a random player acts first. </p>
                <p> Spins will sometimes (10% of the time) not change the spell you're casting. Maybe this should change just because it feels bad? </p>
                <p> Cards always resolve left to right: for example, 1 {<WizardHat />} 1 {<Fireball />} deals 2 damage. </p>
                <p> Whether the game is over is determined after each lane resolves. So for example, you can go to negative life and not die if you heal it immediately, and the game could be a tie. </p>
                <p> You can look at your opponent's spellbooks by clicking the button. The state displayed is always from the start of the turn and, as you can see, doesn't include any information about which spells are active, just which spells were where at the end of the last turn. </p>
                <Button variant="contained" onClick={onClose}>Close</Button>
            </div>
        </div>
    );
}

export default HowToPlay;
