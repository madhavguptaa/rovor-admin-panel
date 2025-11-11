import ProviderComponent from '@/components/layouts/provider-component';
import 'react-perfect-scrollbar/dist/css/styles.css';
import '../styles/tailwind.css';
import { Metadata } from 'next';
import { Nunito } from 'next/font/google';

export const metadata: Metadata = {
    title: {
        template: 'Admin Dashboard',
        default: 'Elysion Softwares',
    },
    icons: {
        icon: [
            { url: '/rovor-logo.svg', type: 'image/svg+xml' },
            { url: '/favicon.png', sizes: '512x512', type: 'image/png' },
        ],
        shortcut: '/rovor-logo.svg',
        apple: '/rovor-logo.svg',
    },
};
const nunito = Nunito({
    weight: ['400', '500', '600', '700', '800'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-nunito',
});


export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={nunito.variable}>
                <ProviderComponent>{children}</ProviderComponent>
            </body>
        </html>
    );
}
