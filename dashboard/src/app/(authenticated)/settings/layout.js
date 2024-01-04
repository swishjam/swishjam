import Tabs from "@/components/Settings/Tabs";

export default function SettingsLayout({ children }) {
  return (
    <>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
        <Tabs className="my-8" />
        {children}
      </main>
    </>
  )
}