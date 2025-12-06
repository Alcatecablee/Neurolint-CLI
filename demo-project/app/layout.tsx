import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'NeuroLint Demo',
  description: 'Demo showcasing NeuroLint capabilities'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const savedTheme = localStorage.getItem('theme')
  
  return (
    <html lang="en" className={savedTheme}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
