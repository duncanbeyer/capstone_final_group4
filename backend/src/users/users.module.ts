import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserResolver } from './users.resolver';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [UsersService, UserResolver],
    exports: [UsersService],
})
export class UsersModule {}
