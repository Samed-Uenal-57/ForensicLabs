window.tailwind = window.tailwind || {};
window.tailwind.config = {
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                cyber: {
                    50: '#eef6ff',
                    100: '#e0edff',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    800: '#075985',
                    900: '#0f172a',
                    950: '#020617'
                },
                accent: {
                    green: '#10b981',
                    purple: '#a855f7',
                    amber: '#f59e0b',
                    rose: '#f43f5e'
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['Fira Code', 'Courier New', 'monospace']
            }
        }
    }
};
