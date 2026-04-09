import { Module } from '@nestjs/common';
import { CategoryModule } from './category/category.module';
import { ChatModule } from './chat/chat.module';
import { MessageModule } from './message/message.module';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    CategoryModule,
    OrderModule,
    PaymentModule,
    ChatModule,
    MessageModule,
  ],
})
export class MarketplaceModule {}
