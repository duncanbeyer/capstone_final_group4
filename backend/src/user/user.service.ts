import { Injectable } from '@nestjs/common';
import { CreateUserInput } from './inputs/create-user.input';
import { UpdateUserInput } from './inputs/update-user.input';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { UserAuth } from 'src/user-auth/user-auth.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private repo: Repository<User>,
        @InjectRepository(User) private userAuthRepo: Repository<UserAuth>,
    ) {}

    async create(_input: CreateUserInput, _userAuth?: UserAuth): Promise<User> {
        const { userAuthId, ...input } = _input;
        let userAuth = _userAuth;

        if (!userAuth) {
            userAuth = await this.userAuthRepo.findOne({ where: { id: userAuthId } });
        }

        if (!userAuth) {
            throw new Error(`UserService::create() - cannot find user auth with id: ${userAuthId}`);
        }

        const user = await this.repo.save({
            ...input,
            userAuth,
        });

        return user;
    }

    findAll() {
        return `This action returns all user`;
    }

    findById(id: string, relations: FindOneOptions<User>['relations'] = {}) {
        return this.repo.findOne({ where: { id }, relations });
    }

    update(input: UpdateUserInput) {
        return `This action updates a #${input.id} user`;
    }

    remove(id: number) {
        return `This action removes a #${id} user`;
    }

    async addUserToCurrentUserFriends(currentUserId: string, friendUserId: string) {
        const currentUser = await this.repo.findOne({ where: { id: currentUserId }, relations: { friends: true } });

        if (!currentUser) {
            throw new Error(
                `UserService::addUserToCurrentUserFriends() - could not find current user (ID: ${currentUserId})`,
            );
        }

        const friend = await this.repo.findOne({ where: { id: friendUserId }, relations: { friends: true } });

        if (!friend) {
            throw new Error(`UserService::addUserToCurrentUserFriends() - could not find friend (ID: ${friendUserId})`);
        }

        currentUser.friends.push(friend);
        friend.friends.push(currentUser);

        await this.repo.save(currentUser);
        await this.repo.save(friend);

        return currentUser;
    }

    async inviteFriend(currentUserId: string, friendUserId: string) {
        const currentUser = await this.repo.findOne({
            where: { id: currentUserId },
            relations: { sentInvitations: true },
        });

        if (!currentUser) {
            throw new Error(`UserService::inviteFriend() - could not find current user (ID: ${currentUserId})`);
        }

        if (currentUser.sentInvitations === null || currentUser.sentInvitations === undefined) {
            currentUser.sentInvitations = [];
        }

        const friend = await this.repo.findOne({ where: { id: friendUserId }, relations: { friends: true } });

        if (!friend) {
            throw new Error(`UserService::inviteFriend() - could not find friend (ID: ${friendUserId})`);
        }

        if (friend.receivedInvitations === null || friend.receivedInvitations === undefined) {
            friend.receivedInvitations = [];
        }

        currentUser.sentInvitations.push(friend);
        friend.receivedInvitations.push(currentUser);

        await this.repo.save(friend);
        await this.repo.save(currentUser);

        console.log('number of sent invites: ' + currentUser.sentInvitations.length);
        console.log('number of invitee invitations: ' + friend.receivedInvitations.length);
        for (let i = 0; i < currentUser.sentInvitations.length; i++) {
            console.log(currentUser.sentInvitations[i].firstName);
        }

        return true;
    }

    async acceptFriendInvitation(currentUserId: string, friendUserId: string): Promise<void> {
        const currentUser = await this.repo.findOne({
            where: { id: currentUserId },
            relations: { receivedInvitations: true },
        });

        if (!currentUser) {
            throw new Error(
                `UserService::acceptFriendInvitation() - could not find current user (ID: ${currentUserId})`,
            );
        }
        let friend: User;
        for (let i = 0; i < currentUser.receivedInvitations.length; i++) {
            console.log(currentUser.receivedInvitations[i]);
            if (currentUser.receivedInvitations[i].id === friendUserId) {
                friend = currentUser.receivedInvitations[i];
            }
        }
        if (!friend) {
            throw new Error(
                `UserService::acceptFriendInvitation() - could not find friend invitation (ID: ${friendUserId})`,
            );
        }

        friend.isAccepted = true;

        if (currentUser.friends === null || currentUser.friends === undefined) {
            currentUser.friends = [];
        }
        if (friend.friends === null || friend.friends === undefined) {
            friend.friends = [];
        }

        currentUser.friends.push(friend);
        friend.friends.push(currentUser);

        currentUser.receivedInvitations = currentUser.receivedInvitations.filter(
            (invitation) => invitation.id !== friendUserId,
        );

        await this.repo.save(currentUser);
        await this.repo.save(friend);



    }

    async sentFriendInvitations(userId: string) {
        const user = await this.repo.findOne({ where: { id: userId }, relations: { sentInvitations: true } });
        console.log(user.sentInvitations.length);
        console.log(user.firstName);

        return user.sentInvitations;
    }

    async pendingFriendInvitations(userId: string) {
        const user = await this.repo.findOne({ where: { id: userId }, relations: { receivedInvitations: true } });
        const pendingInvitations: User[] = user.receivedInvitations.filter((invitation) => !invitation.isAccepted);
        return pendingInvitations;
    }
}
