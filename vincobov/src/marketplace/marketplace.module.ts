import { Module } from '@nestjs/common';
import { CartModule } from './cart/cart.module';
import { CategoryModule } from './category/category.module';
import { ChatModule } from './chat/chat.module';
import { FavoriteModule } from './favorite/favorite.module';
import { MessageModule } from './message/message.module';
import { NotificationsModule } from './notifications/notifications.module';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    CategoryModule,
    OrderModule,
    PaymentModule,
    ChatModule,
    MessageModule,
    CartModule,
    NotificationsModule,
    FavoriteModule,
  ],
})
export class MarketplaceModule {}
