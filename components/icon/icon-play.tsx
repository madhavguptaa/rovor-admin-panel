import { FC } from 'react';

interface Props {
    className?: string;
}

const IconPlay: FC<Props> = ({ className = 'w-5 h-5' }) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <polygon
                points="5,3 19,12 5,21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="currentColor"
            />
        </svg>
    );
};

export default IconPlay;
