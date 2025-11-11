import { FC } from 'react';

interface Props {
    className?: string;
}

const IconPause: FC<Props> = ({ className = 'w-5 h-5' }) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <rect
                x="6"
                y="4"
                width="4"
                height="16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="currentColor"
            />
            <rect
                x="14"
                y="4"
                width="4"
                height="16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="currentColor"
            />
        </svg>
    );
};

export default IconPause;
