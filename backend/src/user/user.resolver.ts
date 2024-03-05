import { Resolver, Query, Mutation, Args, Int, ResolveField } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './user.entity';
import { UpdateUserInput } from './inputs/update-user.input';
import { Public } from 'src/auth/decorators/public.decorator';
import { CurrentRequestContext, RequestContext } from 'src/auth/decorators/current_request_context.decorator';

@Resolver(() => User)
export class UserResolver {
    constructor(private readonly userService: UserService) {}

    @Query(() => [User])
    listUsers() {
        return this.userService.findAll();
    }

    @Public()
    @Query(() => User)
    getUser(@Args('id', { type: () => String }) id: string) {
        return this.userService.findById(id, { friends: true, bookReviews: { book: true } });
    }

    @Mutation(() => User)
    updateUser(@Args('input') input: UpdateUserInput) {
        return this.userService.update(input);
    }

    @Mutation(() => User)
    removeUser(@Args('id', { type: () => Int }) id: number) {
        return this.userService.remove(id);
    }

    @Mutation(() => User)
    addFriend(
        @Args('friendId', { type: () => String }) friendId: string,
        @CurrentRequestContext() ctx: RequestContext,
    ) {
        const currentUserId = ctx.userId;
        return this.userService.addUserToCurrentUserFriends(currentUserId, friendId);
    }

    @Mutation(() => Boolean)
    async inviteFriend(
        @Args('friendId', { type: () => String }) friendId: string,
        @CurrentRequestContext() ctx: RequestContext,
    ): Promise<boolean> {
        try {
            const currentUserId = ctx.userId;
            await this.userService.inviteFriend(currentUserId, friendId);
            return true;
        } catch (error) {
            return false;
        }
    }

    @Mutation(() => Boolean)
    async acceptFriendInvitation(
        @Args('friendId', { type: () => String }) friendId: string,
        @CurrentRequestContext() ctx: RequestContext,
    ): Promise<boolean> {
        try {
            const currentUserId = ctx.userId;
            await this.userService.acceptFriendInvitation(currentUserId, friendId);
            return true;
        } catch (error) {
            return false;
        }
    }

    @ResolveField(() => [User])
    async sentFriendInvitations(user: User) {
        return this.userService.sentFriendInvitations(user.id);
    }

    @ResolveField(() => [User])
    async pendingFriendInvitations(user: User) {
        return this.userService.pendingFriendInvitations(user.id);
    }
}
