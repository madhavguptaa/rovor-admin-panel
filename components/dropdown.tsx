'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState, ReactNode } from 'react';
import { usePopper } from 'react-popper';

interface DropdownProps {
    button: ReactNode;
    btnClassName?: string;
    offset?: [number, number];
    placement?: any;
    children: ReactNode;
}

const Dropdown = (props: DropdownProps, forwardedRef: any) => {
    const [visibility, setVisibility] = useState(false);
    const referenceRef = useRef<HTMLButtonElement | null>(null);
    const popperRef = useRef<HTMLDivElement | null>(null);

    const { styles, attributes } = usePopper(referenceRef.current, popperRef.current, {
        placement: props.placement || 'bottom-end',
        modifiers: [
            {
                name: 'offset',
                options: {
                    offset: props.offset || [0, 0],
                },
            },
        ],
    });

    const handleDocumentClick = (event: MouseEvent) => {
        if (!referenceRef.current || !popperRef.current) return;
        if (referenceRef.current.contains(event.target as Node) || popperRef.current.contains(event.target as Node)) {
            return;
        }
        setVisibility(false);
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleDocumentClick);
        return () => {
            document.removeEventListener('mousedown', handleDocumentClick);
        };
    }, []);

    useImperativeHandle(forwardedRef, () => ({
        close() {
            setVisibility(false);
        },
    }));

    return (
        <>
            <button ref={referenceRef} type="button" className={props.btnClassName} onClick={() => setVisibility(!visibility)}>
                {props.button}
            </button>

            <div ref={popperRef} style={styles.popper} {...attributes.popper} className="z-50">
                {visibility && <div onClick={() => setVisibility(false)}>{props.children}</div>}
            </div>
        </>
    );
};

export default forwardRef(Dropdown);

