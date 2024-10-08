import { FC, useEffect, useRef } from 'react'
import { Modal, Form, Input, Select, DatePicker, Button, InputRef } from 'antd'
import { useState } from 'react'
import useAuth from '@/hooks/useAuth'
import {
  useGetAllVendor,
  useCreateEventList,
  useGetAllEventList,
  useCreateScheduleBookEvent,
} from '../hooks'
import { OPTION_EVENT_LIST, OPTION_VENDOR_LIST } from '../config'
import { formatDatesRequest } from '@/utils/date'
import { EventDataReqType } from '@/domains/event'

const vendors = [
  { label: 'Nike', value: 'nike' },
  { label: 'Adidas', value: 'adidas' },
]

interface ModalAddEventProps {
  open: boolean
  handleCancel(): void
}

const ModalAddEvent: FC<ModalAddEventProps> = ({ open, handleCancel }) => {
  const { user } = useAuth()
  const { data: dataListEvent, isLoading: loadingList } = useGetAllEventList()
  const { data: dataListVendor } = useGetAllVendor()
  const {
    mutate: mutateSchedule,
    isSuccess,
    isPending: loadingSchedule,
  } = useCreateScheduleBookEvent()
  const { mutate: mutateEvent, isPending } = useCreateEventList()
  const [name, setName] = useState('')
  const inputRef = useRef<InputRef>(null)

  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value)
  }

  const addItem = (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    e.preventDefault()
    mutateEvent({ id_author: user?.id as string, event_name: name })
    setName('')
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }

  const handleFinish = (values: EventDataReqType) => {
    const data = {
      ...values,
      id_author: user?.id as string,
      postal_code: Number(values.postal_code) ?? null,
      proposed_dates: values.proposed_dates.map((date) =>
        formatDatesRequest(date)
      ),
    }
    mutateSchedule(data)
  }

  useEffect(() => {
    if (isSuccess) handleCancel()
  }, [isSuccess])

  return (
    <Modal
      open={open}
      title={
        <h1 className="text-blue-500 text-xl font-semibold">
          Add New Event Book
        </h1>
      }
      onCancel={handleCancel}
      footer={null}
      centered
      className="min-h-2/3 overflow-scroll rounded-lg shadow-md"
    >
      <Form
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ proposed_dates: [] }}
      >
        <Form.Item label="My Company">
          <Input disabled={true} defaultValue={user?.company} />
        </Form.Item>

        <Form.Item
          name="id_event"
          label="Select Event"
          rules={[{ required: true, message: 'Please select an event' }]}
        >
          <Select
            placeholder="Event"
            dropdownRender={(menu) => (
              <>
                {loadingList ? <p>Load Data</p> : menu}
                <div className="flex mt-2">
                  <Input
                    placeholder="Add new self event"
                    ref={inputRef}
                    value={name}
                    onChange={onNameChange}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                  <Button type="primary" onClick={addItem} disabled={isPending}>
                    Add
                  </Button>
                </div>
              </>
            )}
            options={OPTION_EVENT_LIST(dataListEvent || [])}
          />
        </Form.Item>

        <Form.Item
          name="location"
          label="Location"
          rules={[{ required: true, message: 'Please enter the location' }]}
        >
          <Input placeholder="Location" />
        </Form.Item>

        <Form.Item
          name="street_address"
          label="Street Address"
          rules={[
            { required: true, message: 'Please enter the street address' },
          ]}
        >
          <Input placeholder="Street Address" />
        </Form.Item>

        <Form.Item
          name="postal_code"
          label="Postal Code (Optional)"
          rules={[
            {
              type: 'number',
              transform: (value) => (value ? Number(value) : value),
              message: 'Please enter a valid postal code',
            },
          ]}
        >
          <Input placeholder="Postal Code" type="number" />
        </Form.Item>

        <Form.Item
          name="id_vendor"
          label="Select Vendor"
          rules={[{ required: true, message: 'Please select a vendor' }]}
        >
          <Select
            options={OPTION_VENDOR_LIST(dataListVendor || [])}
            placeholder="Select a vendor"
          />
        </Form.Item>

        <Form.Item
          label="Proposed Dates"
          required
          rules={[
            { required: true, message: 'Please select at least one date' },
          ]}
        >
          <Input.Group compact>
            <Form.Item
              name={['proposed_dates', 0]}
              noStyle
              rules={[{ required: true, message: 'Please select date 1' }]}
            >
              <DatePicker placeholder="Date 1" />
            </Form.Item>
            <Form.Item
              name={['proposed_dates', 1]}
              noStyle
              rules={[{ required: true, message: 'Please select date 2' }]}
            >
              <DatePicker placeholder="Date 2" />
            </Form.Item>
            <Form.Item
              name={['proposed_dates', 2]}
              noStyle
              rules={[{ required: true, message: 'Please select date 3' }]}
            >
              <DatePicker placeholder="Date 3" />
            </Form.Item>
          </Input.Group>
        </Form.Item>

        <Form.Item className="flex lg:justify-end w-full">
          <Button
            type="primary"
            htmlType="submit"
            className="lg:w-24 w-full"
            disabled={loadingSchedule}
          >
            {loadingSchedule ? 'Loading' : 'Book'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default ModalAddEvent
