export default function PageWithHeader({ title, buttons, children }) {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
      <div className="grid grid-cols-2 my-8 items-center">
        <div>
          <h1 className="text-lg font-medium text-gray-700 mb-0">{title}</h1>
        </div>
        <div className='flex justify-end items-center space-x-2'>
          {buttons}
        </div>
      </div>
      {children}
    </main>
  )
}