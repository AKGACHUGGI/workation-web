import Modal from '@/components/ui/Modal'

type Props = { open: boolean; onClose: () => void }

export default function LoginModal({ open, onClose }: Props) {
  return (
    <Modal open={open} onClose={onClose} titleId="login-modal-title" width="sm">
      <h2 id="login-modal-title" className="text-heading-xl text-text-primary">
        당신의 장소를 찾으세요
      </h2>
    </Modal>
  )
}
