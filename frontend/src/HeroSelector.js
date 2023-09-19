import React from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import Slot from './Slot';


function HeroSelector({ heroes, hero, setHero, element }) {
    if (!hero || !heroes || !Object.values(heroes).length) {
        return null;
    }
    return (
        <FormControl>
            <InputLabel>{element}</InputLabel>
            <Select
                label={element}
                value={hero}
                onChange={(e) => setHero(e.target.value)}
                style={{ marginBottom: '10px' }}
            >
                {Object.values(heroes).map((h, i) => (
                    (h.element === element) && <MenuItem key={i} value={h.name}>{h.name}</MenuItem>
                ))}
            </Select>
            <Slot
                card={{
                    'text': heroes[hero].description,
                    'name': heroes[hero].name,
                }}
                highlight={false}
                elements={[element]}
                lock={false}
                basic={false}
                hero={true}
            />
        </FormControl>
    )
}

export default HeroSelector;