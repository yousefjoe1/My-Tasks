import { useTheme } from '@/contexts/ThemeContext';
import Image from 'next/image';

const ToggleMode = () => {
    const { theme, toggleTheme } = useTheme();


    return (
        <div className='flex items-center gap-3 relative group border rounded-full w-12 h-12 justify-center'>
            {
                theme === 'pink' &&
                <div
                    className="w-11 h-11 rounded-full bg-secondary hover:bg-tertiary transition-all shadow-lg border border-primary overflow-hidden flex items-center justify-center p-0"

                >
                    <Image
                        height={44}
                        width={44}
                        alt='Pink Moon'
                        src={'/icons/pink-img.png'}
                        className="w-full h-full object-cover"
                    />
                </div>

            }

            {
                theme === 'dark' &&
                <div
                    className="w-11 h-11 rounded-full bg-secondary hover:bg-tertiary transition-all shadow-lg border border-primary overflow-hidden flex items-center justify-center p-0"

                >
                    <svg
                        className="w-5 h-5 text-warning"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                    </svg>
                </div>

            }

            {
                theme === 'light' &&
                <div
                    className="w-11 h-11 rounded-full bg-secondary hover:bg-tertiary transition-all shadow-lg border border-primary overflow-hidden flex items-center justify-center p-0"

                >
                    <svg
                        className="w-5 h-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                        />
                    </svg>
                </div>

            }

            <div className="hidden group-hover:flex items-center gap-2 absolute -bottom-20 h-20 p-2 -left-12 glass-card">
                <button
                    onClick={() => toggleTheme('pink')}
                    className="w-11 h-11 rounded-full bg-secondary hover:bg-tertiary transition-all shadow-lg border border-primary overflow-hidden flex items-center justify-center p-0"
                    aria-label="Toggle Pink theme"
                >
                    <Image
                        height={44}
                        width={44}
                        alt='Pink Moon'
                        src={'/icons/pink-img.png'}
                        className="w-full h-full object-cover"
                    />
                </button>
                <button
                    onClick={() => toggleTheme(theme === 'light' ? 'dark' : 'light')}
                    className=" p-3 rounded-full bg-secondary hover:bg-tertiary transition-colors shadow-lg border border-primary"
                    aria-label="Toggle theme"
                >
                    <svg
                        className="w-5 h-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                        />
                    </svg>
                </button>

                <button
                    onClick={() => toggleTheme(theme === 'light' ? 'dark' : 'light')}
                    className=" p-3 rounded-full bg-secondary hover:bg-tertiary transition-colors shadow-lg border border-primary"
                    aria-label="Toggle theme"
                >

                    <svg
                        className="w-5 h-5 text-warning"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                    </svg>

                </button>
            </div>

        </div >
    )
}

export default ToggleMode