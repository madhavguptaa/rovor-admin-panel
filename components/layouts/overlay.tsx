'use client';

import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { toggleSidebar } from '@/store/themeConfigSlice';

const Overlay = () => {
    const dispatch = useDispatch();
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);

    return (
        <div
            className={`${(!themeConfig.sidebar && 'hidden') || ''} fixed inset-0 z-50 bg-black/60 lg:hidden`}
            onClick={() => dispatch(toggleSidebar())}
        />
    );
};

export default Overlay;

