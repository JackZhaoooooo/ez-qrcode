import 'react-i18next'

declare module 'react-i18next' {
	interface CustomTypeOptions {
		defaultNS: 'translation'
		resources: {
			translation: {
				qrcode: {
					generate: string
					decode: string
					favorite: string
					input: string
					generate_btn: string
					decode_btn: string
					download: string
					copy: string
					favorite_add: string
					favorite_remove: string
					upload: string
					drag: string
					or: string
					click: string
					no_favorites: string
					copied: string
					theme: string
					language: string
				}
			}
		}
	}
}
