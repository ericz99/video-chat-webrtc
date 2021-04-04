import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Icon({ icon, className }) {
    return <FontAwesomeIcon className={className} icon={icon} />;
}
