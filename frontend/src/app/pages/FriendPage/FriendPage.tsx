import { Link, useParams } from 'react-router-dom';
import FriendIndex from 'app/components/compounds/FriendIndex';
import { Autocomplete, Box, TextField, Typography } from '@mui/material';
import useUsersFriends, { useGetReceivedInvites, useListUsers } from './useUserFriends';
import { useAcceptFriendInviteMutation } from 'generated/graphql';
import InviteContainer from 'app/components/compounds/InviteContainer/InviteContainer';
import { useNavigate } from 'react-router-dom';
import { useUserSession } from 'app/core/Session';


export default function FriendPage() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { friends } = useUsersFriends(userId);
    const mySession = useUserSession();
    let myId;
    if (mySession) {
        myId = mySession.id;
    }
    else {
        myId = '';
    }
    const [acceptInvite] = useAcceptFriendInviteMutation();
    const pending = useGetReceivedInvites(acceptInvite, myId);
    const users = useListUsers(myId);
    let searchOptions: string[] = [];
    users.map((value) => {
        searchOptions.push(value.name);
    });

    if (userId !== myId) {
        if (friends.length === 0) {
            return <p>No friends found. Please make some.</p>;
        }
        return (
            <Box>
                <FriendIndex friends={friends} />
            </Box>
        );
    }

    return (
        <Box display="flex" flexDirection="row">
            <Box>
                <InviteContainer {...{ props: pending }}></InviteContainer>
                <Autocomplete
                    disablePortal
                    options={searchOptions}
                    sx={{ width: 300, ml: 6 }} // margin set past 4 to match 'Friend Requests' vertically
                    renderInput={(params) => <TextField {...params} label="Users" />}
                    onChange={(event: any, newValue: string | null) => {
                        for (let i = 0; i < searchOptions.length; i++) {
                            if (searchOptions[i] === newValue) {
                                navigate('/users/' + users[i].id);
                            }
                        }
                    }}
                />
            </Box>
            <FriendIndex friends={friends} />
        </Box>
    );
}
