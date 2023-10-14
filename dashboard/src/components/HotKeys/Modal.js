import Modal from "@/components/utils/Modal";

export default function HotKeyModal({ isOpen, onClose, descriptions }) {
  return (
    <Modal title='Available hot keys' isOpen={isOpen} onClose={onClose}>
      <ul>
        {descriptions.map(({ key, description }) => (
          <li className='flex items-center my-2' key={key}>
            <kbd 
              className='inline-flex h-5 w-5 px-4 py-4 items-center justify-center rounded border bg-white mx-2 border-gray-400 text-gray-600' 
              style={{ boxShadow: '1px 1px grey' }}
            >
              <span className='text-md mr-1'>⌘</span>
              <span className='text-sm'>{key}</span>
            </kbd> 
            <span className='text-sm text-gray-700'>{description}</span>
          </li>
        ))}
      </ul>
    </Modal>
  )
}