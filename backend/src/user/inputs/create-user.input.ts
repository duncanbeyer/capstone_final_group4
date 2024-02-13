import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
    @Field()
    firstName: string;

    @Field()
    lastName: string;

    @Field({ nullable: true })
    bio?: string;

    @Field()
    dateOfBirth: string;

    @Field(() => ID)
    userAuthId: string;
}