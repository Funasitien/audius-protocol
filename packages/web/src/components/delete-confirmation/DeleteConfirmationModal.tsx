import { Nullable } from '@audius/common'
import { Button, ButtonType } from '@audius/harmony'
import { Modal, ModalHeader, ModalTitle, ModalContent } from '@audius/stems'

import styles from './DeleteConfirmationModal.module.css'

export type DeleteConfirmationModalProps = {
  title: string
  customHeader?: Nullable<string>
  customDescription?: Nullable<string>
  visible: boolean
  entity: string
  onDelete: () => void
  onCancel: () => void
}

const DeleteConfirmationModal = (props: DeleteConfirmationModalProps) => {
  const header =
    props.customHeader == null
      ? `This ${props.entity} Will Disappear For Everyone`
      : props.customHeader
  const description =
    props.customDescription == null
      ? `Are you sure you want to delete this ${props.entity.toLowerCase()}?`
      : props.customDescription

  return (
    <Modal isOpen={props.visible} onClose={props.onCancel}>
      <ModalHeader>
        <ModalTitle title={props.title} />
      </ModalHeader>
      <ModalContent>
        <div className={styles.text}>
          <div className={styles.header}>{header}</div>
          <div className={styles.description}>{description}</div>
        </div>

        <div className={styles.buttons}>
          <Button
            className={styles.deleteButton}
            variant={ButtonType.DESTRUCTIVE}
            onClick={props.onDelete}
          >{`Delete ${props.entity}`}</Button>
          <Button
            className={styles.nevermindButton}
            variant={ButtonType.SECONDARY}
            onClick={props.onCancel}
          >
            Nevermind
          </Button>
        </div>
      </ModalContent>
    </Modal>
  )
}

export default DeleteConfirmationModal
