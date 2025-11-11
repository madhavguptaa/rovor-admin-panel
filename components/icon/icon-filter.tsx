import { FC } from 'react';

interface Props {
    className?: string;
}

const IconFilter: FC<Props> = ({ className = 'w-5 h-5' }) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <polygon
                points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export default IconFilter;
