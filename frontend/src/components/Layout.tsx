import { Navbar } from './Navbar'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps): JSX.Element {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        {children}
      </main>
    </>
  )
}
