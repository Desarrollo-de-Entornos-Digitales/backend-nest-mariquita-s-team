import { ShippingStatus } from '../entities/order.entity';

export type ShippingStageDefinition = {
  status: ShippingStatus;
  title: string;
  body: string;
  timelineLabel: string;
};

export const SHIPPING_STAGES: ShippingStageDefinition[] = [
  {
    status: ShippingStatus.ORDER_CONFIRMED,
    title: 'Order confirmed',
    body: 'Your order was registered successfully. We are validating the details.',
    timelineLabel: 'Order confirmed',
  },
  {
    status: ShippingStatus.PAYMENT_VERIFIED,
    title: 'Payment verified',
    body: 'Your payment was approved. The seller will start preparing your order.',
    timelineLabel: 'Payment verified',
  },
  {
    status: ShippingStatus.PREPARING,
    title: 'Preparing shipment',
    body: 'The seller is packing your products for dispatch.',
    timelineLabel: 'Preparing shipment',
  },
  {
    status: ShippingStatus.HANDED_TO_CARRIER,
    title: 'Handed to carrier',
    body: 'Your package was handed to the logistics partner.',
    timelineLabel: 'Handed to carrier',
  },
  {
    status: ShippingStatus.IN_TRANSIT,
    title: 'In transit',
    body: 'Your order is on the way to the delivery address.',
    timelineLabel: 'In transit',
  },
  {
    status: ShippingStatus.OUT_FOR_DELIVERY,
    title: 'Out for delivery',
    body: 'The carrier is close to your address. Get ready to receive it.',
    timelineLabel: 'Out for delivery',
  },
  {
    status: ShippingStatus.DELIVERED,
    title: 'Delivered',
    body: 'Your order was delivered successfully. Thank you for shopping on VincoBov.',
    timelineLabel: 'Delivered',
  },
];

export function getShippingStageIndex(status: ShippingStatus | null | undefined) {
  if (!status) {
    return -1;
  }
  return SHIPPING_STAGES.findIndex((stage) => stage.status === status);
}

export function getNextShippingStage(status: ShippingStatus | null | undefined) {
  const currentIndex = getShippingStageIndex(status);
  if (currentIndex < 0) {
    return SHIPPING_STAGES[0] ?? null;
  }
  return SHIPPING_STAGES[currentIndex + 1] ?? null;
}
