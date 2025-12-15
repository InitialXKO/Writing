/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
    content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		colors: {
  			primary: {
  				'50': '#f8f9fa',
  				'100': '#f1f3f5',
  				'200': '#e9ecef',
  				'300': '#dee2e6',
  				'400': '#ced4da',
  				'500': '#adb5bd',
  				'600': '#868e96',
  				'700': '#495057',
  				'800': '#343a40',
  				'900': '#212529',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				'50': '#f8f9fa',
  				'100': '#f1f3f5',
  				'200': '#e9ecef',
  				'300': '#dee2e6',
  				'400': '#ced4da',
  				'500': '#adb5bd',
  				'600': '#868e96',
  				'700': '#495057',
  				'800': '#343a40',
  				'900': '#212529',
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			success: {
  				'50': '#f8f9fa',
  				'100': '#f1f3f5',
  				'200': '#e9ecef',
  				'300': '#dee2e6',
  				'400': '#ced4da',
  				'500': '#adb5bd',
  				'600': '#868e96',
  				'700': '#495057',
  				'800': '#343a40',
  				'900': '#212529'
  			},
  			warning: {
  				'50': '#f8f9fa',
  				'100': '#f1f3f5',
  				'200': '#e9ecef',
  				'300': '#dee2e6',
  				'400': '#ced4da',
  				'500': '#adb5bd',
  				'600': '#868e96',
  				'700': '#495057',
  				'800': '#343a40',
  				'900': '#212529'
  			},
  			danger: {
  				'50': '#f8f9fa',
  				'100': '#f1f3f5',
  				'200': '#e9ecef',
  				'300': '#dee2e6',
  				'400': '#ced4da',
  				'500': '#adb5bd',
  				'600': '#868e96',
  				'700': '#495057',
  				'800': '#343a40',
  				'900': '#212529'
  			},
  			neutral: {
  				'50': '#f8f9fa',
  				'100': '#f1f3f5',
  				'200': '#e9ecef',
  				'300': '#dee2e6',
  				'400': '#ced4da',
  				'500': '#adb5bd',
  				'600': '#868e96',
  				'700': '#495057',
  				'800': '#343a40',
  				'900': '#212529'
  			},
  			morandi: {
  				blue: {
  					'50': '#e8eef4',
  					'100': '#d9e2ec',
  					'200': '#bcccdc',
  					'300': '#9fb6cb',
  					'400': '#82a0ba',
  					'500': '#658aa9',
  					'600': '#516f87',
  					'700': '#3d5465',
  					'800': '#293943',
  					'900': '#141e21'
  				},
  				green: {
  					'50': '#e6f0ed',
  					'100': '#d8e9e5',
  					'200': '#b1d3cc',
  					'300': '#8abdb2',
  					'400': '#63a799',
  					'500': '#3c917f',
  					'600': '#307466',
  					'700': '#24574c',
  					'800': '#183a33',
  					'900': '#0c1d19'
  				},
  				pink: {
  					'50': '#f6edf0',
  					'100': '#f0e1e5',
  					'200': '#e1c3cb',
  					'300': '#d2a5b1',
  					'400': '#c38797',
  					'500': '#b4697d',
  					'600': '#905464',
  					'700': '#6c3f4b',
  					'800': '#482a32',
  					'900': '#241519'
  				},
  				beige: {
  					'50': '#f7f0ec',
  					'100': '#f2e9e4',
  					'200': '#e5d3c8',
  					'300': '#d8bdae',
  					'400': '#cba792',
  					'500': '#be9176',
  					'600': '#98745e',
  					'700': '#725746',
  					'800': '#4c3a2f',
  					'900': '#261d17'
  				},
  				gray: {
  					'50': '#f1f2f4',
  					'100': '#e9ecef',
  					'200': '#d3d7db',
  					'300': '#bdc2c7',
  					'400': '#a7acb1',
  					'500': '#91969b',
  					'600': '#74787c',
  					'700': '#575a5d',
  					'800': '#3a3c3e',
  					'900': '#1d1e1f'
  				},
  				purple: {
  					'50': '#f1eef4',
  					'100': '#e6dfec',
  					'200': '#cfc3d9',
  					'300': '#b7a7c6',
  					'400': '#9f8ab3',
  					'500': '#876e9f',
  					'600': '#6c597f',
  					'700': '#51435f',
  					'800': '#362d40',
  					'900': '#1b1720'
  				},
  				yellow: {
  					'50': '#f8f3e6',
  					'100': '#f1e7cc',
  					'200': '#e3cf99',
  					'300': '#d5b766',
  					'400': '#c79f33',
  					'500': '#b9871a',
  					'600': '#946c15',
  					'700': '#6f510f',
  					'800': '#4a360a',
  					'900': '#251b05'
  				},
  				orange: {
  					'50': '#f9eee8',
  					'100': '#f3ddcf',
  					'200': '#e6bba0',
  					'300': '#d89871',
  					'400': '#cb7642',
  					'500': '#bd5f2b',
  					'600': '#974c22',
  					'700': '#713819',
  					'800': '#4b2511',
  					'900': '#261209'
  				},
  				red: {
  					'50': '#f7ecec',
  					'100': '#efd9d9',
  					'200': '#dfb3b3',
  					'300': '#cf8d8d',
  					'400': '#bf6767',
  					'500': '#af4141',
  					'600': '#8c3434',
  					'700': '#692727',
  					'800': '#461a1a',
  					'900': '#230d0d'
  				}
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		boxShadow: {
  			card: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  			'card-hover': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  			glow: '0 0 15px rgba(101, 138, 169, 0.3)',
  			'glow-success': '0 0 15px rgba(60, 145, 127, 0.3)',
  			'glow-warning': '0 0 15px rgba(190, 105, 125, 0.3)'
  		},
  		borderRadius: {
  			xl: '1rem',
  			'2xl': '1.5rem',
  			'3xl': '2rem',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		transitionDuration: {
  			'400': '400ms'
  		},
  		transitionTimingFunction: {
  			'bounce-slow': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}