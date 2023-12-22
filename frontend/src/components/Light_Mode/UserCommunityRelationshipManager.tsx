

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Community, User } from '../../interfaces';
import "./UserCommunityRelationshipManager.css";
import { toast } from 'react-hot-toast';
import Leaderboard from './Leaderboard';
import ConfirmJoin from '../ConfirmJoin';
import ConfirmLeave from '../ConfirmLeave';
import UserCommunitySelect from './UserCommunitySelect';
import FrameOneLogo from '../FrameOneLogo';


interface MutationData {
    userId: string;
    communityId: string;
}


interface ManagerProps {
    toggle: boolean | null;
}


const UserCommunityRelationshipManager: React.FC<ManagerProps> = ({ toggle }) => {

    //Selected user or community from drop down menu
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);

    //State for if we want user to confirm joining a community (true = confirmation popup shows up)
    const [confirmJoin, setConfirmJoin] = useState<boolean>(false);

    //State for if we want user to confirm leaving a community (true = confirmation popup shows up)
    const [confirmLeave, setConfirmLeave] = useState<boolean>(false);





    //GET the data
    const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
        queryKey: ['users'],
        queryFn: () => axios.get('http://localhost:8080/user').then(res => res.data)
    });


    const { data: communities, isLoading: communitiesLoading, refetch: refetchCommunities } = useQuery({
        queryKey: ['communities'],
        queryFn: () => axios.get('http://localhost:8080/community/alphabetical').then(res => res.data)
    });


    //ranked communities (descending points order). This data is passed onto the leaderboard component
    const { data: communitiesRanked, isLoading: communitiesRankedLoading, refetch: refetchCommunitiesRanked } = useQuery({
        queryKey: ['communitiesRanked'],
        queryFn: () => axios.get('http://localhost:8080/community/ranked').then(res => res.data)
    });







    //Mutation Functions
    const joinMutation = useMutation({
        mutationFn: (data: MutationData) => axios.post(`http://localhost:8080/user/${data.userId}/join/${data.communityId}`),
        onSuccess: () => {

            //REFETCH THE DATA UPON COMPLETION SO THAT
            //THE USER CAN'T CREATE DUPLICATES IN THE DATABASE with multiple button clicks
            refetchUsers();
            refetchCommunities();
            refetchCommunitiesRanked();

            toast.success('Successfully joined the community')
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            toast.error(`Error: ${error.message}`);
        }
    });


    const leaveMutation = useMutation({
        mutationFn: (data: MutationData) => axios.delete(`http://localhost:8080/user/${data.userId}/leave/${data.communityId}`),
        onSuccess: () => {
            toast.success('Successfully left the community');

            //REFETCH THE DATA UPON COMPLETION SO THAT THE USER CAN'T CREATE DUPLICATES IN THE DATABASE
            refetchUsers();
            refetchCommunities();
            refetchCommunitiesRanked();

            // UPDATE THE SELECTED USER TO NULL AFTER THE REFETCH IS COMPLETE
            //otherwise the selectedUser state might be the old user so it gets buggy when you click more button
            setSelectedUser(null);


        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            toast.error(`Error: ${error.message}`);
        }
    });






    //Handlers
    const handleJoinClick = () => {

        //if a user and community is selected
        if (selectedUser && selectedCommunity) {


            //find the selected user and community in the data
            const theSelectedUser = users.find((user: User) => user._id === selectedUser)
            const theSelectedCommunity = communities.find((community: Community) => community._id === selectedCommunity)


            //check if the selected user already has a community. 

            //if the selected user has a community, and it is the same as the selected community,
            //throw an error "You are already a member of this community"
            if (theSelectedUser && theSelectedUser.communityName === theSelectedCommunity.name) {
                toast.error("You are already a member of this community")
            }


            //else if the user has a community that's not the same as the selected community,
            //prompt a join confirmation popup:
            //"You can join only one community at a time. Would you like to leave your community and join the selected community?""
            else if (theSelectedUser && theSelectedUser.communityName) {
                setConfirmJoin(true);
            }

            //else if user doesn't have a community, join the selected community
            else {
                joinMutation.mutate({ userId: selectedUser, communityId: selectedCommunity })
            }

        }

        else {
            toast.error("Please select a user and a community")
        }

    };



    const handleConfirmJoin = (confirmed: boolean) => {

        //When user confirms, join the community
        if (confirmed && selectedUser && selectedCommunity) {
            joinMutation.mutate({ userId: selectedUser, communityId: selectedCommunity })
        }

        //Get rid of confirmation popup
        setConfirmJoin(false);
    }





    const handleLeaveClick = () => {
        if (selectedUser && selectedCommunity) {

            //find the selected user and community in the data
            const theSelectedUser = users.find((user: User) => user._id === selectedUser)
            const theSelectedCommunity = communities.find((community: Community) => community._id === selectedCommunity)

            //check if the user has a community to leave. If not, show error popup
            if (!theSelectedUser.communityName) {
                toast.error("You do not have a community to leave. Please join a community.")
            }

            //Else if the selected community is NOT the same as the community the user joined,
            //throw error
            else if (theSelectedCommunity.name !== theSelectedUser.communityName) {
                toast.error("This is not the community you joined\n You are a member of: " + theSelectedUser.communityName)
            }

            //else prompt a leave confirmation popup
            //***If they leave, they will lose any experience points they collected for that community.
            //My assumption: the total points of a given community
            //is the total points accrued by its ACTIVE members (so any points accrued by EX-members will be deleted)
            else {
                setConfirmLeave(true);
            }
        }

        else {
            toast.error("Please select a user and a community")
        }
    };


    const handleConfirmLeave = (confirmed: boolean) => {

        if (confirmed && selectedUser && selectedCommunity) {
            leaveMutation.mutate({ userId: selectedUser, communityId: selectedCommunity })
        }

        setConfirmLeave(false);
    }






    if (usersLoading || communitiesLoading || communitiesRankedLoading) return 'Loading...';





    return (

        <div id="wrapper">


            <FrameOneLogo toggle={toggle} />


            <UserCommunitySelect
                set_user={setSelectedUser}
                set_community={setSelectedCommunity}
                handle_join_click={handleJoinClick}
                handle_leave_click={handleLeaveClick}
                communities={communities}
                users={users} />






            <Leaderboard communitiesRanked={communitiesRanked} />

            {confirmJoin && (
                <ConfirmJoin handle_join={handleConfirmJoin} />
            )}

            {confirmLeave && (
                <ConfirmLeave handle_leave={handleConfirmLeave} />
            )}

        </div>

    );




};

export default UserCommunityRelationshipManager;